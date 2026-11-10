"use client";

import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { createRouteAPI } from "../api/create-route";
import type { CreateRoutePayload, RouteResponse } from "../api/types";
import { ApiError } from "../../types";

type UseCreateRouteOptions = Omit<
  UseMutationOptions<RouteResponse, ApiError, CreateRoutePayload>,
  "mutationFn"
>;

/* Mutation tạo tuyến trong hãng; lỗi là ApiError từ interceptor. */
export function useCreateRoute(
  companyId: string,
  options?: UseCreateRouteOptions
) {
  return useMutation<RouteResponse, ApiError, CreateRoutePayload>({
    mutationFn: (payload) => createRouteAPI(companyId, payload),
    ...options,
  });
}