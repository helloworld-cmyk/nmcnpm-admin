"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { listStopsAPI } from "../api/list-stops";
import type { StopResponse } from "../api/types";
import { ApiError } from "../../types";

type UseStopsOptions = Omit<
  UseQueryOptions<StopResponse[], ApiError>,
  "queryKey" | "queryFn"
>;

/* Query danh sách điểm đón/trả của hãng; chỉ gọi khi có companyId. */
export function useStops(companyId: string, options?: UseStopsOptions) {
  return useQuery<StopResponse[], ApiError>({
    queryKey: ["company-stops", companyId],
    queryFn: () => listStopsAPI(companyId),
    enabled: companyId.length > 0,
    ...options,
  });
}