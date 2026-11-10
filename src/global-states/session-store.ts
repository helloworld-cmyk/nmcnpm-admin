import { create } from "zustand";
import { STORAGE_KEYS } from "@/config/constants/storage";
import { getItem, getJSON, removeItem, setItem, setJSON } from "@/config/storage";
import { useCompanyStore } from "./company-store";

export type SessionUser = {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
};

/** Cặp token trả về từ /auth/login hoặc /auth/refresh. */
export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
};

type SessionState = {
  user: SessionUser | null;
  hydrated: boolean;
  /** Đọc phiên đăng nhập + token từ storage — gọi trong useEffect ở consumer. */
  hydrate: () => void;
  /** Lưu token và hồ sơ người dùng sau khi đăng nhập thành công. */
  login: (user: SessionUser, tokens: SessionTokens) => void;
  /** Cập nhật hồ sơ người dùng (ví dụ sau khi gọi /me) mà không đụng token. */
  setUser: (user: SessionUser) => void;
  /** Xóa phiên đăng nhập, token và hãng đang chọn. */
  logout: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  hydrated: false,

  hydrate: () => {
    const user = getJSON<SessionUser>(STORAGE_KEYS.AUTH_ADMIN);
    const valid =
      user !== null && typeof user === "object" && typeof user.name === "string"
        ? user
        : null;
    set({ user: valid, hydrated: true });
  },

  login: (user, tokens) => {
    setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    setJSON(STORAGE_KEYS.AUTH_ADMIN, user);
    set({ user });
  },

  setUser: (user) => {
    setJSON(STORAGE_KEYS.AUTH_ADMIN, user);
    set({ user });
  },

  logout: () => {
    removeItem(STORAGE_KEYS.AUTH_ADMIN);
    removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    useCompanyStore.getState().clear();
    set({ user: null });
  },
}));

/** Có token access hợp lệ đang lưu hay không (đọc đồng bộ từ storage). */
export function hasStoredToken(): boolean {
  const token = getItem(STORAGE_KEYS.ACCESS_TOKEN);
  return token !== null && token.length > 0;
}
