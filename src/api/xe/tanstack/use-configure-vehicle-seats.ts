"use client";

import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { configureVehicleSeatsAPI } from "../api/configure-vehicle-seats";
import type {
  ConfigureVehicleSeatsPayload,
  VehicleSeatLayoutResponse,
} from "../api/types";
import { ApiError } from "../../types";

type UseConfigureVehicleSeatsOptions = Omit<
  UseMutationOptions<
    VehicleSeatLayoutResponse,
    ApiError,
    ConfigureVehicleSeatsPayload
  >,
  "mutationFn"
>;

/* Mutation cấu hình sơ đồ ghế của xe; lỗi là ApiError từ interceptor. */
export function useConfigureVehicleSeats(
  companyId: string,
  vehicleId: string,
  options?: UseConfigureVehicleSeatsOptions
) {
  return useMutation<
    VehicleSeatLayoutResponse,
    ApiError,
    ConfigureVehicleSeatsPayload
  >({
    mutationFn: (payload) => configureVehicleSeatsAPI(companyId, vehicleId, payload),
    ...options,
  });
}
