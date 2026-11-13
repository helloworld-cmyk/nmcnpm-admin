import {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { STORAGE_KEYS } from "@/config/constants/storage";
import { getItem } from "@/config/storage";
import { useSessionStore } from "@/global-states/session-store";

import { getQueryClient } from "./query-client-registry";

import { refreshAccessTokenAPI, type RefreshResponse } from "./auth/api/refresh";
import { AuthClient } from "./client/auth-client";
import { NoAuthClient } from "./client/no-auth-client";
import { APP_CODE, ApiError, type ApiEnvelope } from "./types";

/* ApiError kèm config request gốc để có thể gửi lại sau khi làm mới token. */
type RetryableApiError = ApiError & {
  requestConfig?: InternalAxiosRequestConfig;
};

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/* Thông điệp khi phiên hết hạn và không thể tự làm mới token. */
const SESSION_EXPIRED_MESSAGE =
  "Phiên đăng nhập đã hết hạn, vui lòng đăng xuất và đăng nhập lại (please logout and try again).";

/* Bóc envelope { code, message, wsResponse }; lỗi nghiệp vụ reject thành ApiError. */
function normalizeResponse<T>(
  response: AxiosResponse<T>
): AxiosResponse<T> | Promise<AxiosResponse<T>> {
  const body = response.data as ApiEnvelope<unknown> | undefined;

  if (body && typeof body === "object" && "code" in body) {
    if (body.code === APP_CODE.SUCCESS) {
      response.data = body.wsResponse as T;
      return response;
    }
    const apiError = new ApiError(
      body.code,
      body.message,
      response.status
    ) as RetryableApiError;
    apiError.requestConfig = response.config;
    return Promise.reject(apiError);
  }

  return response;
}

/* Lấy config request gốc của lỗi (AxiosError HTTP hoặc ApiError nghiệp vụ). */
function getRequestConfig(error: unknown): RetryableConfig | undefined {
  if (error instanceof ApiError) {
    return (error as RetryableApiError).requestConfig as
      | RetryableConfig
      | undefined;
  }
  if (error instanceof AxiosError) {
    return error.config as RetryableConfig | undefined;
  }
  return undefined;
}

/* Lỗi xác thực: HTTP 401 hoặc mã nghiệp vụ INVALID_TOKEN trong envelope. */
function isAuthFailure(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.code === APP_CODE.INVALID_TOKEN;
  }
  if (error instanceof AxiosError) {
    if (error.response?.status === 401) return true;
    const body = error.response?.data as ApiEnvelope<unknown> | undefined;
    return Boolean(
      body &&
        typeof body === "object" &&
        "code" in body &&
        body.code === APP_CODE.INVALID_TOKEN
    );
  }
  return false;
}

/*
 * Phiên không thể tiếp tục: xóa toàn bộ token, hồ sơ người dùng, hãng đang chọn
 * và cache query (vd. ["me"]) để lần đăng nhập sau không dùng lại dữ liệu của
 * người trước. Interceptor không có router nên chỉ cập nhật store — SessionGate
 * thấy `user === null` sẽ tự chuyển về trang đăng nhập.
 */
function endSession(): void {
  useSessionStore.getState().logout();
  getQueryClient()?.clear();
}

/* Gắn access token hiện có vào mọi yêu cầu của client cần xác thực. */
function attachAuthRequestInterceptor(client: AxiosInstance): void {
  client.interceptors.request.use((config) => {
    const accessToken = getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });
}

/* Gắn xử lý envelope chung; client cần xác thực truyền thêm hàm làm mới token. */
function attachResponseInterceptor(
  client: AxiosInstance,
  refreshToken?: () => Promise<RefreshResponse>
): void {
  /*
   * 1) Chuẩn hóa envelope TRƯỚC: lỗi nghiệp vụ (vd. code INVALID_TOKEN trả về
   *    cùng HTTP 200) cũng bị reject và rơi vào bước xử lý lỗi bên dưới.
   */
  client.interceptors.response.use(normalizeResponse);

  /* 2) Gặp lỗi xác thực thì làm mới token rồi gửi lại request đúng một lần. */
  client.interceptors.response.use(undefined, async (error) => {
    const original = getRequestConfig(error);

    if (refreshToken && original && isAuthFailure(error)) {
      /* Còn refresh token và chưa thử lại -> làm mới phiên. */
      if (!original._retry && getItem(STORAGE_KEYS.REFRESH_TOKEN)) {
        original._retry = true;
        try {
          const tokens = await refreshToken();
          original.headers.Authorization = `Bearer ${tokens.accessToken}`;
          return client(original);
        } catch {
          /* Làm mới thất bại -> kết thúc phiên ở dưới. */
        }
      }

      /*
       * Không thể làm mới (hết refresh token / đã thử lại / refresh thất bại):
       * ngừng xoay token và báo người dùng đăng xuất rồi đăng nhập lại.
       */
      endSession();
      return Promise.reject(
        new ApiError(APP_CODE.INVALID_TOKEN, SESSION_EXPIRED_MESSAGE, 401)
      );
    }

    if (error instanceof ApiError) {
      return Promise.reject(error);
    }

    const axiosError = error as AxiosError;
    const body = axiosError.response?.data as ApiEnvelope<unknown> | undefined;
    if (body && typeof body === "object" && "code" in body) {
      return Promise.reject(
        new ApiError(body.code, body.message, axiosError.response?.status)
      );
    }

    return Promise.reject(error);
  });
}

/* AuthClient: gắn token + tự làm mới phiên khi gặp 401. */
attachAuthRequestInterceptor(AuthClient);
attachResponseInterceptor(AuthClient, refreshAccessTokenAPI);

/* NoAuthClient: chỉ chuẩn hóa envelope, không đụng tới token. */
attachResponseInterceptor(NoAuthClient);