"use client";

import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { replaceRouteStopsAPI } from "../api/replace-route-stops";
import type { ReplaceRouteStopsPayload, RouteResponse } from "../api/types";
import { ApiError } from "../../types";

export type ReplaceRouteStopsVariables = {
  routeId: string;
  payload: ReplaceRouteStopsPayload;
};

type UseReplaceRouteStopsOptions = Omit<
  UseMutationOptions<RouteResponse, ApiError, ReplaceRouteStopsVariables>,
  "mutationFn"
>;

/* Mutation thay thế toàn bộ điểm dừng mẫu của tuyến; lỗi là ApiError. */
export function useReplaceRouteStops(
  companyId: string,
  options?: UseReplaceRouteStopsOptions
) {
  return useMutation<RouteResponse, ApiError, ReplaceRouteStopsVariables>({
    mutationFn: ({ routeId, payload }) =>
      replaceRouteStopsAPI(companyId, routeId, payload),
    ...options,
  });
}