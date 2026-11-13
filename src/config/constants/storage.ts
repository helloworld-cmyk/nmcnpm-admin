/**
 * Key dùng chung khi truy cập browser storage.
 * Luôn lấy key từ đây, không hardcode chuỗi key ở component/store.
 */
export const STORAGE_KEYS = {
  /** Hồ sơ quản trị viên đã đăng nhập: { name: string, ... } */
  AUTH_ADMIN: "vvv.auth.admin",
  /** Access token hiện tại của phiên quản trị. */
  ACCESS_TOKEN: "vvv.auth.accessToken",
  /** Refresh token dùng để xoay vòng phiên khi access token hết hạn. */
  REFRESH_TOKEN: "vvv.auth.refreshToken",
  /** Thời điểm access token hết hạn (epoch milliseconds) để làm mới chủ động. */
  EXPIRES_AT: "vvv.auth.expiresAt",
  /** Hãng xe đang được chọn để quản lý (companyId). */
  SELECTED_COMPANY: "vvv.company.selected",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];