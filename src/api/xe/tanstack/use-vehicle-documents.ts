"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { listVehicleDocumentsAPI } from "../api/list-vehicle-documents";
import type { VehicleDocumentResponse } from "../api/types";
import { ApiError } from "../../types";

type UseVehicleDocumentsOptions = Omit<
  UseQueryOptions<VehicleDocumentResponse[], ApiError>,
  "queryKey" | "queryFn"
>;

/* Query danh sách giấy tờ của xe; chỉ gọi khi có đủ companyId và vehicleId. */
export function useVehicleDocuments(
  companyId: string,
  vehicleId: string,
  options?: UseVehicleDocumentsOptions
) {
  return useQuery<VehicleDocumentResponse[], ApiError>({
    queryKey: ["company-vehicle-documents", companyId, vehicleId],
    queryFn: () => listVehicleDocumentsAPI(companyId, vehicleId),
    enabled: companyId.length > 0 && vehicleId.length > 0,
    ...options,
  });
}
