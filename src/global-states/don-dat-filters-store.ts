import { create } from "zustand";

import type { DonDatTab } from "@/app/(admin)/don-dat/_data/don-dat";

/* Bộ lọc dùng chung của màn Quản lý đơn đặt (tab trạng thái + tìm kiếm + ngày khởi hành). */
type DonDatFiltersState = {
  tab: DonDatTab;
  search: string;
  /* Khoảng ngày khởi hành (yyyy-MM-dd), rỗng = không lọc. */
  departureFrom: string;
  departureTo: string;
  page: number;
  setTab: (tab: DonDatTab) => void;
  setSearch: (search: string) => void;
  setDepartureRange: (from: string, to: string) => void;
  setPage: (page: number) => void;
  reset: () => void;
};

const FIRST_PAGE = 1;

export const useDonDatFiltersStore = create<DonDatFiltersState>((set) => ({
  tab: "all",
  search: "",
  departureFrom: "",
  departureTo: "",
  page: FIRST_PAGE,

  setTab: (tab) => set({ tab, page: FIRST_PAGE }),
  setSearch: (search) => set({ search, page: FIRST_PAGE }),
  setDepartureRange: (departureFrom, departureTo) =>
    set({ departureFrom, departureTo, page: FIRST_PAGE }),
  setPage: (page) => set({ page }),

  reset: () =>
    set({
      tab: "all",
      search: "",
      departureFrom: "",
      departureTo: "",
      page: FIRST_PAGE,
    }),
}));
