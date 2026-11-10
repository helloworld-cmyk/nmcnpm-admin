"use client";

import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { loginAPI, type LoginPayload, type LoginResponse } from "../api/login";
import { ApiError } from "../../types";

type UseLoginOptions = Omit<
  UseMutationOptions<LoginResponse, ApiError, LoginPayload>,
  "mutationFn"
>;

/* Mutation đăng nhập; lỗi trả về là ApiError từ interceptor. */
export function useLogin(options?: UseLoginOptions) {
  return useMutation<LoginResponse, ApiError, LoginPayload>({
    mutationFn: loginAPI,
    ...options,
  });
}