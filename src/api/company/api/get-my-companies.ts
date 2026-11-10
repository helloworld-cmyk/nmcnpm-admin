import { authApi } from "../../method";

/* Trạng thái hãng xe. */
export type BusCompanyStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

/* Trạng thái thành viên của tài khoản trong hãng. */
export type CompanyMemberStatus = "INVITED" | "ACTIVE" | "SUSPENDED" | "LEFT";

/* Vai trò của tài khoản trong hãng. */
export type CompanyMemberRoleType = "COMPANY_ADMIN" | "DRIVER";

/* Phản hồi /me/companies: một hãng mà tài khoản hiện tại đang tham gia. */
export type MyCompanyResponse = {
  companyId: string;
  companyName: string;
  companySlug: string;
  hotline: string | null;
  timezone: string;
  companyStatus: BusCompanyStatus;
  membershipStatus: CompanyMemberStatus;
  joinedAt: string;
  roles: CompanyMemberRoleType[];
};

/* Gọi API lấy các hãng đang hoạt động mà tài khoản hiện tại là thành viên. */
export function getMyCompaniesAPI(): Promise<MyCompanyResponse[]> {
  return authApi.get<MyCompanyResponse[]>("/me/companies");
}