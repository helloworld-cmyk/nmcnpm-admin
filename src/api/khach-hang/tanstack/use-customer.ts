"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getCustomerAPI } from "../api/get-customer";
import type { CompanyCustomerDetailResponse } from "../api/types";
import { ApiError } from "../../types";

type UseCustomerOptions = Omit<
  UseQueryOptions<CompanyCustomerDetailResponse, ApiError>,
  "queryKey" | "queryFn"
>;

/* Query chi tiết khách hàng; chỉ gọi khi có đủ companyId và customerId. */
export function useCustomer(
  companyId: string,
  customerId: string,
  options?: UseCustomerOptions
) {
  return useQuery<CompanyCustomerDetailResponse, ApiError>({
    queryKey: ["company-customer", companyId, customerId],
    queryFn: () => getCustomerAPI(companyId, customerId),
    enabled: companyId.length > 0 && customerId.length > 0,
    ...options,
  });
}
