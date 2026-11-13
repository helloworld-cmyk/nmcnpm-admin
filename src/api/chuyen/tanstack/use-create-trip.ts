"use client";

import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { createTripAPI } from "../api/create-trip";
import type { CreateTripPayload, CreateTripResponse } from "../api/types";
import { ApiError } from "../../types";

type UseCreateTripOptions = Omit<
  UseMutationOptions<CreateTripResponse, ApiError, CreateTripPayload>,
  "mutationFn"
>;

/* Mutation tạo chuyến nháp trong hãng; lỗi là ApiError từ interceptor. */
export function useCreateTrip(
  companyId: string,
  options?: UseCreateTripOptions
) {
  return useMutation<CreateTripResponse, ApiError, CreateTripPayload>({
    mutationFn: (payload) => createTripAPI(companyId, payload),
    ...options,
  });
}