"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getVehicleAPI } from "../api/get-vehicle";
import type { VehicleResponse } from "../api/types";
import { ApiError } from "../../types";

type UseVehicleOptions = Omit<
  UseQueryOptions<VehicleResponse, ApiError>,
  "queryKey" | "queryFn"
>;

/* Query chi tiết xe theo id; chỉ gọi khi có đủ companyId và vehicleId. */
export function useVehicle(
  companyId: string,
  vehicleId: string,
  options?: UseVehicleOptions
) {
  return useQuery<VehicleResponse, ApiError>({
    queryKey: ["company-vehicle", companyId, vehicleId],
    queryFn: () => getVehicleAPI(companyId, vehicleId),
    enabled: companyId.length > 0 && vehicleId.length > 0,
    ...options,
  });
}
