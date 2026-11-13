"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getVehicleSeatsAPI } from "../api/get-vehicle-seats";
import type { VehicleSeatLayoutResponse } from "../api/types";
import { ApiError } from "../../types";

type UseVehicleSeatsOptions = Omit<
  UseQueryOptions<VehicleSeatLayoutResponse, ApiError>,
  "queryKey" | "queryFn"
>;

/* Query sơ đồ ghế của xe; chỉ gọi khi có đủ companyId và vehicleId. */
export function useVehicleSeats(
  companyId: string,
  vehicleId: string,
  options?: UseVehicleSeatsOptions
) {
  return useQuery<VehicleSeatLayoutResponse, ApiError>({
    queryKey: ["company-vehicle-seats", companyId, vehicleId],
    queryFn: () => getVehicleSeatsAPI(companyId, vehicleId),
    enabled: companyId.length > 0 && vehicleId.length > 0,
    ...options,
  });
}
