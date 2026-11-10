"use client";

import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { updateTripAPI } from "../api/update-trip";
import type { TripResponse, UpdateTripPayload } from "../api/types";
import { ApiError } from "../../types";

export type UpdateTripVariables = {
  tripId: string;
  payload: UpdateTripPayload;
};

type UseUpdateTripOptions = Omit<
  UseMutationOptions<TripResponse, ApiError, UpdateTripVariables>,
  "mutationFn"
>;

/* Mutation cập nhật chuyến nháp; lỗi là ApiError từ interceptor. */
export function useUpdateTrip(
  companyId: string,
  options?: UseUpdateTripOptions
) {
  return useMutation<TripResponse, ApiError, UpdateTripVariables>({
    mutationFn: ({ tripId, payload }) =>
      updateTripAPI(companyId, tripId, payload),
    ...options,
  });
}