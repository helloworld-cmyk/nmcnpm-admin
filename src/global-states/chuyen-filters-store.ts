import { create } from "zustand";

export type ChuyenSortKey = "ma" | "khoiHanh" | "daDat" | "giaVe";
export type ChuyenSortDir = "asc" | "desc";
export type ChuyenView = "bang" | "lich";
export type ChuyenTab = string;

export type ChuyenFilters = {
  search: string;
  ngay: string;
  tuyen: string;
  taixe: string;
};

export const EMPTY_CHUYEN_FILTERS: ChuyenFilters = {
  search: "",
  ngay: "",
  tuyen: "all",
  taixe: "all",
};

type ChuyenFiltersState = {
  view: ChuyenView;
  tab: ChuyenTab;
  filters: ChuyenFilters;
  page: number;
  sortKey: ChuyenSortKey | null;
  sortDir: ChuyenSortDir;
  setView: (view: ChuyenView) => void;
  setTab: (tab: ChuyenTab) => void;
  setFilter: (key: keyof ChuyenFilters, value: string) => void;
  setPage: (page: number) => void;
  toggleSort: (key: ChuyenSortKey) => void;
  reset: () => void;
};

const FIRST_PAGE = 1;

export const useChuyenFiltersStore = create<ChuyenFiltersState>((set) => ({
  view: "bang",
  tab: "all",
  filters: EMPTY_CHUYEN_FILTERS,
  page: FIRST_PAGE,
  sortKey: null,
  sortDir: "asc",

  setView: (view) => set({ view }),
  setTab: (tab) => set({ tab, page: FIRST_PAGE }),

  setFilter: (key, value) =>
    set((state) => {
      const filters = { ...state.filters };
      filters[key] = value;
      return { filters, page: FIRST_PAGE };
    }),

  setPage: (page) => set({ page }),

  toggleSort: (key) =>
    set((state) =>
      state.sortKey === key
        ? { sortDir: state.sortDir === "asc" ? "desc" : "asc" }
        : { sortKey: key, sortDir: "asc" }
    ),

  reset: () =>
    set({
      tab: "all",
      filters: EMPTY_CHUYEN_FILTERS,
      page: FIRST_PAGE,
      sortKey: null,
      sortDir: "asc",
    }),
}));
