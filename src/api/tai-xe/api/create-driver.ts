import { authApi } from "../../method";
import { wrapRequest } from "../../types";

import type {
  CompanyDriverCredentialResponse,
  CreateDriverPayload,
} from "./types";

/* Gọi API tạo tài khoản tài xế; backend sinh mật khẩu tạm trả về một lần. */
export function createDriverAPI(
  companyId: string,
  payload: CreateDriverPayload
): Promise<CompanyDriverCredentialResponse> {
  return authApi.post<CompanyDriverCredentialResponse>(
    `/bus-companies/${companyId}/drivers`,
    wrapRequest(payload)
  );
}
