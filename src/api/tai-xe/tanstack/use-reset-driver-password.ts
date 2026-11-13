"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { resetDriverPasswordAPI } from "../api/reset-driver-password";
import type {
  CompanyDriverCredentialResponse,
  ResetDriverPasswordPayload,
} from "../api/types";
import { ApiError } from "../../types";

export type ResetDriverPasswordVariables = {
  driverId: string;
  payload: ResetDriverPasswordPayload;
};

type UseResetDriverPasswordOptions = Omit<
  UseMutationOptions<
    CompanyDriverCredentialResponse,
    ApiError,
    ResetDriverPasswordVariables
  >,
  "mutationFn"
>;

/* Mutation đặt lại mật khẩu tài xế; trả về mật khẩu tạm chỉ xem được một lần. */
export function useResetDriverPassword(
  companyId: string,
  options?: UseResetDriverPasswordOptions
) {
  return useMutation<
    CompanyDriverCredentialResponse,
    ApiError,
    ResetDriverPasswordVariables
  >({
    mutationFn: ({ driverId, payload }) =>
      resetDriverPasswordAPI(companyId, driverId, payload),
    ...options,
  });
}
