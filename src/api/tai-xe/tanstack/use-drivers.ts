"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { listDriversAPI } from "../api/list-drivers";
import type { CompanyDriverResponse, ListDriversQuery } from "../api/types";
import { ApiError, type PageResponse } from "../../types";

type UseDriversOptions = Omit<
  UseQueryOptions<PageResponse<CompanyDriverResponse>, ApiError>,
  "queryKey" | "queryFn"
>;

/* Query danh sách tài xế của hãng (phân trang phía server); chỉ gọi khi có companyId. */
export function useDrivers(
  companyId: string,
  query?: ListDriversQuery,
  options?: UseDriversOptions
) {
  return useQuery<PageResponse<CompanyDriverResponse>, ApiError>({
    queryKey: [
      "company-drivers",
      companyId,
      query?.search ?? "",
      query?.status ?? "",
      query?.page ?? 0,
      query?.size ?? 10,
    ],
    queryFn: () => listDriversAPI(companyId, query),
    enabled: companyId.length > 0,
    ...options,
  });
}
