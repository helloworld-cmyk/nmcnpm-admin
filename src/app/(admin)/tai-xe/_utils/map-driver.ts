import type { CompanyDriverResponse } from "@/api/tai-xe/api/types";

import { formatNgay, nhomGplx, type TaiXe } from "./tai-xe";

/* CompanyDriverResponse → TaiXe (view-model của màn Quản lý tài xế). */
export function mapDriver(driver: CompanyDriverResponse): TaiXe {
  return {
    id: driver.driverId,
    ten: driver.fullName,
    /* SĐT có thể null ở backend → dùng chuỗi rỗng để form/validate không vỡ. */
    soDienThoai: driver.phone ?? "",
    email: driver.email ?? "",
    gplx: driver.licenseNumber ? nhomGplx(driver.licenseNumber) : "—",
    gplxRaw: driver.licenseNumber ?? "",
    hangGplx: driver.licenseClass ?? "",
    hanGplx: driver.licenseExpiresOn ?? "",
    trips30Days: driver.tripCount30Days,
    trangThai: driver.status === "ACTIVE" ? "active" : "locked",
    statusNote: driver.statusNote ?? "",
    ngayTao: formatNgay(driver.createdAt),
  };
}

/* Map danh sách tài xế từ backend. */
export function mapDrivers(drivers: CompanyDriverResponse[]): TaiXe[] {
  return drivers.map(mapDriver);
}
