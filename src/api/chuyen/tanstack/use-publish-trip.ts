"use client";

import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { publishTripAPI } from "../api/publish-trip";
import type { TripResponse } from "../api/types";
import { ApiError } from "../../types";

type UsePublishTripOptions = Omit<
  UseMutationOptions<TripResponse, ApiError, string>,
  "mutationFn"
>;

/* Mutation công bố/mở bán chuyến; biến truyền vào là tripId. */
export function usePublishTrip(
  companyId: string,
  options?: UsePublishTripOptions
) {
  return useMutation<TripResponse, ApiError, string>({
    mutationFn: (tripId) => publishTripAPI(companyId, tripId),
    ...options,
  });
}