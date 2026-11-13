"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { updateDriverStatusAPI } from "../api/update-driver-status";
import type {
  CompanyDriverResponse,
  UpdateDriverStatusPayload,
} from "../api/types";
import { ApiError } from "../../types";

export type UpdateDriverStatusVariables = {
  driverId: string;
  payload: UpdateDriverStatusPayload;
};

type UseUpdateDriverStatusOptions = Omit<
  UseMutationOptions<
    CompanyDriverResponse,
    ApiError,
    UpdateDriverStatusVariables
  >,
  "mutationFn"
>;

/* Mutation khóa hoặc mở khóa tài xế tại hãng. */
export function useUpdateDriverStatus(
  companyId: string,
  options?: UseUpdateDriverStatusOptions
) {
  return useMutation<
    CompanyDriverResponse,
    ApiError,
    UpdateDriverStatusVariables
  >({
    mutationFn: ({ driverId, payload }) =>
      updateDriverStatusAPI(companyId, driverId, payload),
    ...options,
  });
}
