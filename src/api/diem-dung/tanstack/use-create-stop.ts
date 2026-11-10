"use client";

import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { createStopAPI } from "../api/create-stop";
import type { CreateStopPayload, StopResponse } from "../api/types";
import { ApiError } from "../../types";

type UseCreateStopOptions = Omit<
  UseMutationOptions<StopResponse, ApiError, CreateStopPayload>,
  "mutationFn"
>;

/* Mutation tạo điểm đón/trả trong hãng; lỗi là ApiError từ interceptor. */
export function useCreateStop(
  companyId: string,
  options?: UseCreateStopOptions
) {
  return useMutation<StopResponse, ApiError, CreateStopPayload>({
    mutationFn: (payload) => createStopAPI(companyId, payload),
    ...options,
  });
}