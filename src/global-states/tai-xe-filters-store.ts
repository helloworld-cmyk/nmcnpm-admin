import { create } from "zustand";

import type { CompanyDriverStatus } from "@/api/tai-xe/api/types";

type TaiXeFiltersState = {
  search: string;
  trangThai: CompanyDriverStatus | "";
  page: number;
  setSearch: (search: string) => void;
  setTrangThai: (trangThai: CompanyDriverStatus | "") => void;
  setPage: (page: number) => void;
  reset: () => void;
};

const FIRST_PAGE = 1;

/* Bộ lọc dùng chung của màn Quản lý tài xế; đổi bộ lọc luôn đưa về trang đầu. */
export const useTaiXeFiltersStore = create<TaiXeFiltersState>((set) => ({
  search: "",
  trangThai: "",
  page: FIRST_PAGE,

  setSearch: (search) => set({ search, page: FIRST_PAGE }),
  setTrangThai: (trangThai) => set({ trangThai, page: FIRST_PAGE }),
  setPage: (page) => set({ page }),

  reset: () => set({ search: "", trangThai: "", page: FIRST_PAGE }),
}));
