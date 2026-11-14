import { create } from "zustand";

import type { UserAccountStatus } from "@/api/khach-hang/api/types";

export type KhachHangSortKey = "ten" | "datGanNhat" | "veDaDat";
export type KhachHangSortDir = "asc" | "desc";

type KhachHangFiltersState = {
  search: string;
  /* Trạng thái tài khoản theo enum của backend; rỗng = mọi trạng thái. */
  trangThai: UserAccountStatus | "";
  page: number;
  sortKey: KhachHangSortKey | null;
  sortDir: KhachHangSortDir;
  setSearch: (search: string) => void;
  setTrangThai: (trangThai: UserAccountStatus | "") => void;
  setPage: (page: number) => void;
  toggleSort: (key: KhachHangSortKey) => void;
  reset: () => void;
};

const FIRST_PAGE = 1;

export const useKhachHangFiltersStore = create<KhachHangFiltersState>((set) => ({
  search: "",
  trangThai: "",
  page: FIRST_PAGE,
  sortKey: null,
  sortDir: "asc",

  setSearch: (search) => set({ search, page: FIRST_PAGE }),
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
      trangThai: "",
      page: FIRST_PAGE,
      sortKey: null,
      sortDir: "asc",
    }),
}));
