import type {
  XeSortDir,
  XeSortKey,
} from "@/global-states/xe-filters-store";
import type { Xe } from "../_data/vehicles";

export type XeStatsData = {
  total: number;
  hoatDong: number;
  baoTri: number;
  ngungSuDung: number;
};

/*
 * Bộ lọc còn lại ở client. Tìm kiếm (`q`) và trạng thái (`status`) đã được
 * backend lọc sẵn; sức chứa backend chưa hỗ trợ nên vẫn lọc tại client.
 */
export type XeFilterValues = {
  soCho: number | null;
};

export const XE_PAGE_SIZE = 6;

export function filterVehicles(vehicles: Xe[], { soCho }: XeFilterValues) {
  if (soCho === null) return vehicles;
  return vehicles.filter((xe) => xe.soCho === soCho);
}

function sortValue(xe: Xe, sortKey: XeSortKey) {
  if (sortKey === "bienSo") return xe.bienSo;
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

/*
 * Danh sách mức sức chứa cho bộ lọc, lấy từ chính dữ liệu xe của hãng thay vì
 * danh sách cứng (xe có thể có sức chứa bất kỳ: 15, 29, 45...).
 */
export function collectSoChoOptions(
  vehicles: Xe[],
  selected: number | null
): number[] {
  const values = new Set<number>();
  for (const xe of vehicles) values.add(xe.soCho);
  if (selected !== null) values.add(selected);
  return [...values].sort((a, b) => a - b);
}

/*
 * Thống kê trên đúng tập xe đang hiển thị. Tổng = Hoạt động + Bảo trì +
 * Ngưng sử dụng để các thẻ luôn cộng khớp (backend có thể trả xe RETIRED).
 */
export function computeXeStats(vehicles: Xe[]): XeStatsData {
  return {
    total: vehicles.length,
    hoatDong: vehicles.filter((xe) => xe.trangThai === "Đang hoạt động").length,
    baoTri: vehicles.filter((xe) => xe.trangThai === "Đang bảo trì").length,
    ngungSuDung: vehicles.filter((xe) => xe.trangThai === "Ngưng sử dụng")
      .length,
  };
}
