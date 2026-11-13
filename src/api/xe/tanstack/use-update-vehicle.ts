"use client";

import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { updateVehicleAPI } from "../api/update-vehicle";
import type { UpdateVehiclePayload, VehicleResponse } from "../api/types";
import { ApiError } from "../../types";

export type UpdateVehicleVariables = {
  vehicleId: string;
  payload: UpdateVehiclePayload;
};

type UseUpdateVehicleOptions = Omit<
  UseMutationOptions<VehicleResponse, ApiError, UpdateVehicleVariables>,
  "mutationFn"
>;

/* Mutation cập nhật thông tin hoặc trạng thái xe; lỗi là ApiError từ interceptor. */
export function useUpdateVehicle(
  companyId: string,
  options?: UseUpdateVehicleOptions
) {
  return useMutation<VehicleResponse, ApiError, UpdateVehicleVariables>({
    mutationFn: ({ vehicleId, payload }) =>
      updateVehicleAPI(companyId, vehicleId, payload),
    ...options,
  });
}
