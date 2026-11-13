"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { listVehiclesAPI } from "../api/list-vehicles";
import type { ListVehiclesQuery, VehicleResponse } from "../api/types";
import { ApiError } from "../../types";

type UseVehiclesOptions = Omit<
  UseQueryOptions<VehicleResponse[], ApiError>,
  "queryKey" | "queryFn"
>;

/* Query danh sách xe của hãng theo bộ lọc; chỉ gọi khi có companyId. */
export function useVehicles(
  companyId: string,
  query?: ListVehiclesQuery,
  options?: UseVehiclesOptions
) {
  return useQuery<VehicleResponse[], ApiError>({
    queryKey: ["company-vehicles", companyId, query?.q, query?.status],
    queryFn: () => listVehiclesAPI(companyId, query),
    enabled: companyId.length > 0,
    ...options,
  });
}
