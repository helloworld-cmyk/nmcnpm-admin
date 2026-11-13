"use client";

import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { deleteTripAPI } from "../api/delete-trip";
import { ApiError } from "../../types";

type UseDeleteTripOptions = Omit<
  UseMutationOptions<void, ApiError, string>,
  "mutationFn"
>;

/* Mutation xóa chuyến nháp; biến truyền vào là tripId. */
export function useDeleteTrip(
  companyId: string,
  options?: UseDeleteTripOptions
) {
  return useMutation<void, ApiError, string>({
    mutationFn: (tripId) => deleteTripAPI(companyId, tripId),
    ...options,
  });
}
