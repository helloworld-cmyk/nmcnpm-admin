import { authApi } from "../../method";
import { wrapRequest } from "../../types";

import type {
  CompanyDriverCredentialResponse,
  ResetDriverPasswordPayload,
} from "./types";

/* Gọi API đặt lại mật khẩu tài xế; mật khẩu tạm mới chỉ trả về một lần. */
export function resetDriverPasswordAPI(
  companyId: string,
  driverId: string,
  payload: ResetDriverPasswordPayload
): Promise<CompanyDriverCredentialResponse> {
  return authApi.post<CompanyDriverCredentialResponse>(
    `/bus-companies/${companyId}/drivers/${driverId}/reset-password`,
    wrapRequest(payload)
  );
}
