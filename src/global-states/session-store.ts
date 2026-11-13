import { create } from "zustand";
import { STORAGE_KEYS } from "@/config/constants/storage";
import { getItem, getJSON, removeItem, setItem, setJSON } from "@/config/storage";
import { useCompanyStore } from "./company-store";

export type SessionUser = {
  id?: string;
  name: string;
  /** null khi tài khoản không đăng ký bằng email (backend cho phép null). */
  email?: string | null;
  /** null khi tài khoản không đăng ký bằng SĐT (backend cho phép null). */
  phone?: string | null;
};

/** Cặp token trả về từ /auth/login hoặc /auth/refresh. */
export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  /** Thời hạn access token (giây) do backend trả về; null nếu backend không trả. */
  expiresIn?: number | null;
};

type SessionState = {
  user: SessionUser | null;
  /** Thời điểm access token hiện tại hết hạn (epoch ms); null nếu không biết. */
  expiresAt: number | null;
  hydrated: boolean;
  /** Đọc phiên đăng nhập + token từ storage — gọi trong useEffect ở consumer. */
  hydrate: () => void;
  /** Lưu token và hồ sơ người dùng sau khi đăng nhập thành công. */
  login: (user: SessionUser, tokens: SessionTokens) => void;
  /** Ghi cặp token mới sau khi làm mới phiên mà không đụng hồ sơ người dùng. */
  applyTokens: (tokens: SessionTokens) => void;
  /** Cập nhật hồ sơ người dùng (ví dụ sau khi gọi /me) mà không đụng token. */
  setUser: (user: SessionUser) => void;
  /** Xóa phiên đăng nhập, token và hãng đang chọn. */
  logout: () => void;
};

/* Quy đổi thời hạn (giây) thành mốc hết hạn tuyệt đối; dữ liệu thiếu -> null. */
function toExpiresAt(expiresIn?: number | null): number | null {
  if (
    typeof expiresIn !== "number" ||
    !Number.isFinite(expiresIn) ||
    expiresIn <= 0
  ) {
    return null;
  }
  return Date.now() + expiresIn * 1000;
}

/* Ghi token + mốc hết hạn xuống storage và state; dùng chung cho login/refresh. */
function persistTokens(
  set: (partial: Partial<SessionState>) => void,
  tokens: SessionTokens
) {
  const expiresAt = toExpiresAt(tokens.expiresIn);

  setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
  setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  if (expiresAt === null) {
    removeItem(STORAGE_KEYS.EXPIRES_AT);
  } else {
    setItem(STORAGE_KEYS.EXPIRES_AT, String(expiresAt));
  }

  set({ expiresAt });
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  expiresAt: null,
  hydrated: false,

  hydrate: () => {
    const user = getJSON<SessionUser>(STORAGE_KEYS.AUTH_ADMIN);
    const valid =
      user !== null && typeof user === "object" && typeof user.name === "string"
        ? user
        : null;
    const storedExpiry = getItem(STORAGE_KEYS.EXPIRES_AT);
    const expiresAt = storedExpiry === null ? null : Number(storedExpiry);

    set({
      user: valid,
      expiresAt:
        expiresAt !== null && Number.isFinite(expiresAt) ? expiresAt : null,
      hydrated: true,
    });
  },

  login: (user, tokens) => {
    persistTokens(set, tokens);
    setJSON(STORAGE_KEYS.AUTH_ADMIN, user);
    set({ user });
  },

  applyTokens: (tokens) => {
    persistTokens(set, tokens);
  },

  setUser: (user) => {
    setJSON(STORAGE_KEYS.AUTH_ADMIN, user);
    set({ user });
  },

  logout: () => {
    removeItem(STORAGE_KEYS.AUTH_ADMIN);
    removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    removeItem(STORAGE_KEYS.EXPIRES_AT);
    useCompanyStore.getState().clear();
    set({ user: null, expiresAt: null });
  },
}));

/** Có token access đang lưu hay không (đọc đồng bộ từ storage). */
export function hasStoredToken(): boolean {
  const token = getItem(STORAGE_KEYS.ACCESS_TOKEN);
  return token !== null && token.length > 0;
}