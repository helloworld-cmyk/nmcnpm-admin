"use client";

import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { deleteVehicleAPI } from "../api/delete-vehicle";
import { ApiError } from "../../types";

type UseDeleteVehicleOptions = Omit<
  UseMutationOptions<void, ApiError, string>,
  "mutationFn"
>;

/* Mutation ngừng hoặc xóa xe khỏi hãng; biến truyền vào là vehicleId. */
export function useDeleteVehicle(
  companyId: string,
  options?: UseDeleteVehicleOptions
) {
  return useMutation<void, ApiError, string>({
    mutationFn: (vehicleId) => deleteVehicleAPI(companyId, vehicleId),
    ...options,
  });
}
