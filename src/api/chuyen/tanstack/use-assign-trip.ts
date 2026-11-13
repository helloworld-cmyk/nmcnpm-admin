"use client";

import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { assignTripAPI } from "../api/assign-trip";
import type { AssignTripPayload, TripAssignmentResponse } from "../api/types";
import { ApiError } from "../../types";

type AssignTripVariables = { tripId: string; payload: AssignTripPayload };

type UseAssignTripOptions = Omit<
  UseMutationOptions<TripAssignmentResponse, ApiError, AssignTripVariables>,
  "mutationFn"
>;

/* Mutation gán hoặc thay xe và tài xế cho chuyến (tripId truyền theo biến); lỗi là ApiError. */
export function useAssignTrip(companyId: string, options?: UseAssignTripOptions) {
  return useMutation<TripAssignmentResponse, ApiError, AssignTripVariables>({
    mutationFn: ({ tripId, payload }) => assignTripAPI(companyId, tripId, payload),
    ...options,
  });
}
