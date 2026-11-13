"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { putVehicleDocumentAPI } from "../api/put-vehicle-document";
import type {
  VehicleDocumentPayload,
  VehicleDocumentResponse,
  VehicleDocumentType,
} from "../api/types";
import { ApiError } from "../../types";

export type PutVehicleDocumentVariables = {
  type: VehicleDocumentType;
  payload: VehicleDocumentPayload;
};

type UsePutVehicleDocumentOptions = Omit<
  UseMutationOptions<
    VehicleDocumentResponse,
    ApiError,
    PutVehicleDocumentVariables
  >,
  "mutationFn"
>;

/* Mutation thêm/cập nhật giấy tờ của xe; lỗi là ApiError từ interceptor. */
export function usePutVehicleDocument(
  companyId: string,
  vehicleId: string,
  options?: UsePutVehicleDocumentOptions
) {
  return useMutation<
    VehicleDocumentResponse,
    ApiError,
    PutVehicleDocumentVariables
  >({
    mutationFn: ({ type, payload }) =>
      putVehicleDocumentAPI(companyId, vehicleId, type, payload),
    ...options,
  });
}
