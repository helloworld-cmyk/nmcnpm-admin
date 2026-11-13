"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { cancelBookingAPI } from "../api/cancel-booking";
import type { CancelBookingPayload, CompanyBookingResponse } from "../api/types";
import { ApiError } from "../../types";

export type CancelBookingVariables = {
  bookingId: string;
  payload: CancelBookingPayload;
};

type UseCancelBookingOptions = Omit<
  UseMutationOptions<CompanyBookingResponse, ApiError, CancelBookingVariables>,
  "mutationFn"
>;

/* Mutation admin hãng hủy đơn đặt vé; lỗi là ApiError từ interceptor. */
export function useCancelBooking(
  companyId: string,
  options?: UseCancelBookingOptions
) {
  return useMutation<CompanyBookingResponse, ApiError, CancelBookingVariables>({
    mutationFn: ({ bookingId, payload }) =>
      cancelBookingAPI(companyId, bookingId, payload),
    ...options,
  });
}
