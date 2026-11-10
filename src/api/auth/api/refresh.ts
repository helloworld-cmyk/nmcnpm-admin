import { STORAGE_KEYS } from "@/config/constants/storage";
import { getItem, setItem } from "@/config/storage";

import { NoAuthClient } from "../../client/no-auth-client";
import { APP_CODE, ApiError, wrapRequest } from "../../types";

export type RefreshPayload = {
  refreshToken: string;
};

/* Phản hồi /auth/refresh: cặp token mới sau khi xoay refresh token. */
export type RefreshResponse = {
  tokenType: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

/* Gọi API làm mới token bằng refresh token hiện có. */
export async function requestNewTokensAPI(
  refreshToken: string
): Promise<RefreshResponse> {
  const response = await NoAuthClient.post<RefreshResponse>(
    "/auth/refresh",
    wrapRequest<RefreshPayload>({ refreshToken })
  );
  return response.data;
}

/* Gộp nhiều yêu cầu làm mới đồng thời thành một lần gọi API duy nhất. */
let refreshPromise: Promise<string> | null = null;

async function refreshAccessTokenOnce(): Promise<string> {
  const refreshToken = getItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (!refreshToken) {
    throw new ApiError(APP_CODE.INVALID_TOKEN, "Chưa có refresh token");
  }

  try {
    const tokens = await requestNewTokensAPI(refreshToken);
    setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    return tokens.accessToken;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      APP_CODE.INVALID_TOKEN,
      "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"
    );
  }
}

/* Lấy access token mới; các lời gọi song song dùng chung một promise. */
export function refreshAccessTokenAPI(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessTokenOnce().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}