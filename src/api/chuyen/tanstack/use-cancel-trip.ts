"use client";

import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { cancelTripAPI } from "../api/cancel-trip";
import type { CancelTripPayload, TripResponse } from "../api/types";
import { ApiError } from "../../types";

export type CancelTripVariables = {
  tripId: string;
  payload: CancelTripPayload;
};

type UseCancelTripOptions = Omit<
  UseMutationOptions<TripResponse, ApiError, CancelTripVariables>,
  "mutationFn"
>;

/* Mutation hủy chuyến chưa bắt đầu; lỗi là ApiError từ interceptor. */
export function useCancelTrip(
  companyId: string,
  options?: UseCancelTripOptions
) {
  return useMutation<TripResponse, ApiError, CancelTripVariables>({
    mutationFn: ({ tripId, payload }) =>
      cancelTripAPI(companyId, tripId, payload),
    ...options,
  });
}
