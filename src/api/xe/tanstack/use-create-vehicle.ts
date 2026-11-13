"use client";

import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { createVehicleAPI } from "../api/create-vehicle";
import type { CreateVehiclePayload, VehicleResponse } from "../api/types";
import { ApiError } from "../../types";

type UseCreateVehicleOptions = Omit<
  UseMutationOptions<VehicleResponse, ApiError, CreateVehiclePayload>,
  "mutationFn"
>;

/* Mutation thêm xe cho hãng; lỗi là ApiError từ interceptor. */
export function useCreateVehicle(
  companyId: string,
  options?: UseCreateVehicleOptions
) {
  return useMutation<VehicleResponse, ApiError, CreateVehiclePayload>({
    mutationFn: (payload) => createVehicleAPI(companyId, payload),
    ...options,
  });
}
