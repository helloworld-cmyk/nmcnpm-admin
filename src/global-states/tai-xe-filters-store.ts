import { create } from "zustand";

export type TaiXeStatusFilter = "all" | "active" | "locked";

type TaiXeFiltersState = {
  search: string;
  status: TaiXeStatusFilter;
  page: number;
  setSearch: (search: string) => void;
  setStatus: (status: TaiXeStatusFilter) => void;
  setPage: (page: number) => void;
  reset: () => void;
};

const FIRST_PAGE = 1;

export const useTaiXeFiltersStore = create<TaiXeFiltersState>((set) => ({
  search: "",
  status: "all",
  page: FIRST_PAGE,

  setSearch: (search) => set({ search, page: FIRST_PAGE }),
  setStatus: (status) => set({ status, page: FIRST_PAGE }),
  setPage: (page) => set({ page }),

  reset: () =>
    set({
      search: "",
      status: "all",
      page: FIRST_PAGE,
    }),
}));
