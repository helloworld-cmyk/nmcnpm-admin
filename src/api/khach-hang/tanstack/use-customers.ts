"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { listCustomersAPI } from "../api/list-customers";
import type {
  CompanyCustomerResponse,
  ListCustomersQuery,
} from "../api/types";
import { ApiError } from "../../types";

type UseCustomersOptions = Omit<
  UseQueryOptions<CompanyCustomerResponse[], ApiError>,
  "queryKey" | "queryFn"
>;

/* Query danh sách khách hàng của hãng theo bộ lọc; chỉ gọi khi có companyId. */
export function useCustomers(
  companyId: string,
  query?: ListCustomersQuery,
  options?: UseCustomersOptions
) {
  return useQuery<CompanyCustomerResponse[], ApiError>({
    queryKey: [
      "company-customers",
      companyId,
      query?.q,
      query?.accountStatus,
      query?.bookingStatus,
    ],
    queryFn: () => listCustomersAPI(companyId, query),
    enabled: companyId.length > 0,
    ...options,
  });
}
