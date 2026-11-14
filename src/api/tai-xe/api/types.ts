/* Kiểu dữ liệu tài xế dùng chung cho các endpoint /bus-companies/{id}/drivers. */

import type { TripStatus } from "@/api/chuyen/api/types";

/* Trạng thái tài khoản tài xế tại hãng. */
export type CompanyDriverStatus = "ACTIVE" | "LOCKED";

/* Trạng thái phân công chuyến của tài xế. */
export type DriverAssignmentStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "REJECTED"
  | "PREPARING"
  | "ARRIVED"
  | "COMPLETED"
  | "REPLACED";

/* Hạng giấy phép lái xe được backend chấp nhận. */
export type LicenseClass = "B1" | "B2" | "C1" | "C" | "D1" | "D2" | "E";

/* Thông tin tài xế của hãng. */
export type CompanyDriverResponse = {
  driverId: string;
  companyId: string;
  /* Tài xế "legacy" chưa có hồ sơ → các trường dưới đây có thể null. */
  profileId: string | null;
  fullName: string;
  /* UserAccount.phone có thể null (tài khoản chưa gắn SĐT). */
  phone: string | null;
  email: string | null;
  licenseNumber: string | null;
  licenseClass: string | null;
  licenseExpiresOn: string | null;
  status: CompanyDriverStatus;
  statusNote: string | null;
  tripCount30Days: number;
  createdAt: string;
  updatedAt: string;
};

/* Tham số lọc + phân trang danh sách tài xế; page bắt đầu từ 0. */
export type ListDriversQuery = {
  search?: string;
  status?: CompanyDriverStatus;
  page?: number;
  size?: number;
};

/* Body tạo tài khoản tài xế; backend sinh mật khẩu tạm và chỉ trả về một lần. */
export type CreateDriverPayload = {
  fullName: string;
  phone: string;
  email?: string;
  licenseNumber: string;
  licenseClass: LicenseClass;
  licenseExpiresOn: string;
};

/* Body cập nhật tài xế; trường không gửi được giữ nguyên, email rỗng để xóa. */
export type UpdateDriverPayload = {
  fullName?: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  licenseClass?: LicenseClass;
  licenseExpiresOn?: string;
};

/* Body khóa/mở khóa tài xế tại hãng. */
export type UpdateDriverStatusPayload = {
  status: CompanyDriverStatus;
  note?: string;
};

/* Body đặt lại mật khẩu tài xế. */
export type ResetDriverPasswordPayload = {
  note?: string;
};

/* Thông tin đăng nhập cấp một lần khi tạo hoặc đặt lại mật khẩu. */
export type CompanyDriverCredentialResponse = {
  driverId: string;
  fullName: string;
  login: string;
  temporaryPassword: string;
};

/* Một chuyến được phân công gần đây của tài xế. */
export type CompanyDriverTripResponse = {
  tripId: string;
  tripCode: string;
  routeName: string;
  departureAt: string;
  expectedArrivalAt: string;
  status: TripStatus;
  assignmentStatus: DriverAssignmentStatus;
  assignedAt: string;
};
