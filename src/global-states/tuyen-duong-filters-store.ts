import { create } from "zustand";

export type TuyenDuongTrangThaiFilter = "" | "active" | "paused";

type TuyenDuongFiltersState = {
  search: string;
  trangThai: TuyenDuongTrangThaiFilter;
  page: number;
  setSearch: (search: string) => void;
  setTrangThai: (trangThai: TuyenDuongTrangThaiFilter) => void;
  setPage: (page: number) => void;
  reset: () => void;
};

const FIRST_PAGE = 1;

export const useTuyenDuongFiltersStore = create<TuyenDuongFiltersState>(
  (set) => ({
    search: "",
    trangThai: "",
    page: FIRST_PAGE,

    setSearch: (search) => set({ search, page: FIRST_PAGE }),
    setTrangThai: (trangThai) => set({ trangThai, page: FIRST_PAGE }),
    setPage: (page) => set({ page }),

    reset: () =>
      set({
        search: "",
        trangThai: "",
        page: FIRST_PAGE,
      }),
  })
);
