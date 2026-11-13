"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { createDriverAPI } from "../api/create-driver";
import type {
  CompanyDriverCredentialResponse,
  CreateDriverPayload,
} from "../api/types";
import { ApiError } from "../../types";

type UseCreateDriverOptions = Omit<
  UseMutationOptions<
    CompanyDriverCredentialResponse,
    ApiError,
    CreateDriverPayload
  >,
  "mutationFn"
>;

/* Mutation tạo tài khoản tài xế; lỗi là ApiError từ interceptor. */
export function useCreateDriver(
  companyId: string,
  options?: UseCreateDriverOptions
) {
  return useMutation<
    CompanyDriverCredentialResponse,
    ApiError,
    CreateDriverPayload
  >({
    mutationFn: (payload) => createDriverAPI(companyId, payload),
    ...options,
  });
}
