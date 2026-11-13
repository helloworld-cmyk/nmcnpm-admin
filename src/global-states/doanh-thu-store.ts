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

const pad2 = (value: number) => String(value).padStart(2, "0");

const isoOf = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

/* Khoảng ngày (yyyy-MM-dd) cho từng kỳ, tính theo ngày hiện tại. */
function rangeFor(period: Exclude<DoanhThuPeriod, "tuy-chon">): {
  from: string;
  to: string;
} {
  const now = new Date();
  if (period === "hom-nay") {
    const today = isoOf(now);
    return { from: today, to: today };
  }
  if (period === "tuan-nay") {
    const day = (now.getDay() + 6) % 7;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
    return { from: isoOf(monday), to: isoOf(now) };
  }
  if (period === "thang-nay") {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: isoOf(first), to: isoOf(now) };
  }
  const firstPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastPrev = new Date(now.getFullYear(), now.getMonth(), 0);
  return { from: isoOf(firstPrev), to: isoOf(lastPrev) };
}

const DEFAULT_PERIOD: DoanhThuPeriod = "thang-nay";
const DEFAULT_RANGE = rangeFor(DEFAULT_PERIOD);

type DoanhThuFilterState = {
  period: DoanhThuPeriod;
  from: string;
  to: string;
  setPeriod: (period: DoanhThuPeriod) => void;
  setCustomRange: (from: string, to: string) => void;
};

export const useDoanhThuStore = create<DoanhThuFilterState>((set) => ({
  period: DEFAULT_PERIOD,
  from: DEFAULT_RANGE.from,
  to: DEFAULT_RANGE.to,

  setPeriod: (period) =>
    set(() => {
      if (period === "tuy-chon") return { period };
      return { period, ...rangeFor(period) };
    }),

  setCustomRange: (from, to) =>
    set(() => {
      const nextFrom = from || DEFAULT_RANGE.from;
      const nextTo = to || nextFrom;
      return {
        period: "tuy-chon" as DoanhThuPeriod,
        from: nextFrom,
        to: nextFrom > nextTo ? nextFrom : nextTo,
      };
    }),
}));
