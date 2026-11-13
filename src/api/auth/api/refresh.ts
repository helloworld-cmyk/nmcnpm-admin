import { STORAGE_KEYS } from "@/config/constants/storage";
import { getItem } from "@/config/storage";
import { useSessionStore } from "@/global-states/session-store";

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
async function requestNewTokensAPI(
  refreshToken: string
): Promise<RefreshResponse> {
  const response = await NoAuthClient.post<RefreshResponse>(
    "/auth/refresh",
    wrapRequest<RefreshPayload>({ refreshToken })
  );
  return response.data;
}

/* Gộp nhiều yêu cầu làm mới đồng thời thành một lần gọi API duy nhất. */
let refreshPromise: Promise<RefreshResponse> | null = null;

async function refreshSessionOnce(): Promise<RefreshResponse> {
  const refreshToken = getItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (!refreshToken) {
    throw new ApiError(APP_CODE.INVALID_TOKEN, "Chưa có refresh token");
  }

  try {
    const tokens = await requestNewTokensAPI(refreshToken);
    useSessionStore.getState().applyTokens({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    });
    return tokens;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      APP_CODE.INVALID_TOKEN,
      "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"
    );
  }
}

/* Lấy cặp token mới; các lời gọi song song dùng chung một promise. */
export function refreshAccessTokenAPI(): Promise<RefreshResponse> {
  if (!refreshPromise) {
    refreshPromise = refreshSessionOnce().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}