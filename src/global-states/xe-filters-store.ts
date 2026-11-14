import { create } from "zustand";

export type XeSortKey = "bienSo" | "soCho" | "trangThai";
export type XeSortDir = "asc" | "desc";

type XeFiltersState = {
  search: string;
  soCho: number | null;
  trangThai: string;
  page: number;
  sortKey: XeSortKey | null;
  sortDir: XeSortDir;
  setSearch: (search: string) => void;
  setSoCho: (soCho: number | null) => void;
  setTrangThai: (trangThai: string) => void;
  setPage: (page: number) => void;
  toggleSort: (key: XeSortKey) => void;
  reset: () => void;
};

const FIRST_PAGE = 1;

export const useXeFiltersStore = create<XeFiltersState>((set) => ({
  search: "",
  soCho: null,
  trangThai: "",
  page: FIRST_PAGE,
  sortKey: null,
  sortDir: "asc",

  setSearch: (search) => set({ search, page: FIRST_PAGE }),
  setSoCho: (soCho) => set({ soCho, page: FIRST_PAGE }),
  setTrangThai: (trangThai) => set({ trangThai, page: FIRST_PAGE }),
  setPage: (page) => set({ page }),

  toggleSort: (key) =>
    set((state) =>
      state.sortKey === key
        ? { sortDir: state.sortDir === "asc" ? "desc" : "asc" }
        : { sortKey: key, sortDir: "asc" }
    ),

  reset: () =>
    set({
      search: "",
      soCho: null,
      trangThai: "",
      page: FIRST_PAGE,
      sortKey: null,
      sortDir: "asc",
    }),
}));
