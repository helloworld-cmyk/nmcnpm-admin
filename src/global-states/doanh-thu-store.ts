import { create } from "zustand";

export type DoanhThuPeriod =
  | "hom-nay"
  | "tuan-nay"
  | "thang-nay"
  | "thang-truoc"
  | "tuy-chon";

export const DOANH_THU_PERIOD_OPTIONS: {
  value: DoanhThuPeriod;
  label: string;
}[] = [
  { value: "hom-nay", label: "Hôm nay" },
  { value: "tuan-nay", label: "Tuần này" },
  { value: "thang-nay", label: "Tháng này" },
  { value: "thang-truoc", label: "Tháng trước" },
  { value: "tuy-chon", label: "Tuỳ chọn" },
];

const PERIOD_RANGES: Record<
  Exclude<DoanhThuPeriod, "tuy-chon">,
  { from: string; to: string }
> = {
  "hom-nay": { from: "2026-10-31", to: "2026-10-31" },
  "tuan-nay": { from: "2026-10-26", to: "2026-10-31" },
  "thang-nay": { from: "2026-10-01", to: "2026-10-31" },
  "thang-truoc": { from: "2026-09-01", to: "2026-09-30" },
};

type DoanhThuFilterState = {
  period: DoanhThuPeriod;
  from: string;
  to: string;
  route: string;
  setPeriod: (period: DoanhThuPeriod) => void;
  setCustomRange: (from: string, to: string) => void;
  setRoute: (route: string) => void;
};

export const useDoanhThuStore = create<DoanhThuFilterState>((set) => ({
  period: "thang-nay",
  from: "2026-10-01",
  to: "2026-10-31",
  route: "all",

  setPeriod: (period) =>
    set((state) => ({
      period,
      from: period === "tuy-chon" ? state.from : PERIOD_RANGES[period].from,
      to: period === "tuy-chon" ? state.to : PERIOD_RANGES[period].to,
    })),

  setCustomRange: (from, to) =>
    set(() => {
      const nextFrom = from || "2026-10-01";
      const nextTo = to || nextFrom;
      return {
        period: "tuy-chon" as DoanhThuPeriod,
        from: nextFrom,
        to: nextFrom > nextTo ? nextFrom : nextTo,
      };
    }),

  setRoute: (route) => set({ route }),
}));
