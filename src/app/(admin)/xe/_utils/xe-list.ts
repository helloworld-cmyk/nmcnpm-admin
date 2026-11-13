import type {
  XeSortDir,
  XeSortKey,
} from "@/global-states/xe-filters-store";
import type { Xe } from "../_data/vehicles";

export type XeStatsData = {
  total: number;
  hoatDong: number;
  baoTri: number;
};

export type XeFilterValues = {
  search: string;
  soCho: number | null;
  trangThai: string;
};

export const XE_PAGE_SIZE = 6;

export function filterVehicles(
  vehicles: Xe[],
  { search, soCho, trangThai }: XeFilterValues
) {
  const query = search.trim().toLowerCase();
  return vehicles.filter((xe) => {
    const haystack = `${xe.bienSo} ${xe.taiXe ?? ""}`.toLowerCase();
    return (
      (!query || haystack.includes(query)) &&
      (soCho === null || xe.soCho === soCho) &&
      (!trangThai || xe.trangThai === trangThai)
    );
  });
}

function sortValue(xe: Xe, sortKey: XeSortKey) {
  if (sortKey === "bienSo") return xe.bienSo;
  if (sortKey === "taiXe") return xe.taiXe ?? "";
  return xe.trangThai;
}

export function sortVehicles(
  vehicles: Xe[],
  sortKey: XeSortKey | null,
  sortDir: XeSortDir
) {
  if (!sortKey) return vehicles;
  const direction = sortDir === "asc" ? 1 : -1;
  return [...vehicles].sort((a, b) => {
    if (sortKey === "soCho") return (a.soCho - b.soCho) * direction;
    const left = sortValue(a, sortKey);
    const right = sortValue(b, sortKey);
    return left.localeCompare(right, "vi") * direction;
  });
}

export function computePageCount(totalCount: number) {
  return Math.max(1, Math.ceil(totalCount / XE_PAGE_SIZE));
}

export function computeXeStats(vehicles: Xe[]): XeStatsData {
  return {
    total: vehicles.length,
    hoatDong: vehicles.filter((xe) => xe.trangThai === "Đang hoạt động").length,
    baoTri: vehicles.filter((xe) => xe.trangThai === "Đang bảo trì").length,
  };
}
