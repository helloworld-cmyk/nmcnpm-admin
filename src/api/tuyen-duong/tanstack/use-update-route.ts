"use client";

import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { updateRouteAPI } from "../api/update-route";
import type { RouteResponse, UpdateRoutePayload } from "../api/types";
import { ApiError } from "../../types";

export type UpdateRouteVariables = {
  routeId: string;
  payload: UpdateRoutePayload;
};

type UseUpdateRouteOptions = Omit<
  UseMutationOptions<RouteResponse, ApiError, UpdateRouteVariables>,
  "mutationFn"
>;

/* Mutation cập nhật tuyến; lỗi là ApiError từ interceptor. */
export function useUpdateRoute(
  companyId: string,
  options?: UseUpdateRouteOptions
) {
  return useMutation<RouteResponse, ApiError, UpdateRouteVariables>({
    mutationFn: ({ routeId, payload }) =>
      updateRouteAPI(companyId, routeId, payload),
    ...options,
  });
}