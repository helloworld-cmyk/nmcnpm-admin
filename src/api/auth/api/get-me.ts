import { authApi } from "../../method";

/* Trạng thái tài khoản. */
export type AccountStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "CLOSED";

/* Phản hồi /me: thông tin tài khoản hiện tại lấy từ access token. */
export type MeResponse = {
  id: string;
  fullName: string;
  /** Có thể null: tài khoản đăng ký chỉ bằng SĐT. */
  phone: string | null;
  /** Có thể null: tài khoản đăng ký chỉ bằng SĐT. */
  email: string | null;
  accountStatus: AccountStatus;
  createdAt: string;
  authorities: string[];
};

/* Tiền tố authority BE cấp cho quản trị viên của một hãng: "COMPANY_ADMIN:<companyId>". */
export const COMPANY_ADMIN_AUTHORITY_PREFIX = "COMPANY_ADMIN:";

/* Lý do chặn truy cập khu vực quản trị. */
export type AdminAccessDenial = {
  reason: "account-inactive" | "no-company-admin";
  message: string;
};

/* Tài khoản có authority quản trị của ít nhất một hãng hay không. */
export function isCompanyAdmin(me: MeResponse): boolean {
  return me.authorities.some((authority) =>
    authority.startsWith(COMPANY_ADMIN_AUTHORITY_PREFIX)
  );
}

/*
 * Kiểm tra quyền vào khu vực quản trị: tài khoản phải ACTIVE và là COMPANY_ADMIN
 * của ít nhất một hãng. Trả null nếu hợp lệ, ngược lại trả lý do để UI báo lỗi.
 */
export function getAdminAccessDenial(me: MeResponse): AdminAccessDenial | null {
  if (me.accountStatus !== "ACTIVE") {
    return {
      reason: "account-inactive",
      message:
        "Tài khoản của bạn chưa được kích hoạt nên không thể truy cập khu vực quản trị.",
    };
  }

  if (!isCompanyAdmin(me)) {
    return {
      reason: "no-company-admin",
      message:
        "Tài khoản này không phải quản trị viên (COMPANY_ADMIN) của hãng xe nào. Vui lòng đăng nhập bằng tài khoản quản trị.",
    };
  }

  return null;
}

/* Gọi API lấy thông tin tài khoản đang đăng nhập. */
export function getMeAPI(): Promise<MeResponse> {
  return authApi.get<MeResponse>("/me");
}