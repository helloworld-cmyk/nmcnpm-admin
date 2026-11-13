"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { updateDriverAPI } from "../api/update-driver";
import type { CompanyDriverResponse, UpdateDriverPayload } from "../api/types";
import { ApiError } from "../../types";

export type UpdateDriverVariables = {
  driverId: string;
  payload: UpdateDriverPayload;
};

type UseUpdateDriverOptions = Omit<
  UseMutationOptions<CompanyDriverResponse, ApiError, UpdateDriverVariables>,
  "mutationFn"
>;

/* Mutation cập nhật thông tin và giấy phép lái xe của tài xế. */
export function useUpdateDriver(
  companyId: string,
  options?: UseUpdateDriverOptions
) {
  return useMutation<CompanyDriverResponse, ApiError, UpdateDriverVariables>({
    mutationFn: ({ driverId, payload }) =>
      updateDriverAPI(companyId, driverId, payload),
    ...options,
  });
}
