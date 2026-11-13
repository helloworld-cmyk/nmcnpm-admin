import type {
  ChuyenRecord,
  LenhPhanCong,
  SucoTrangThai,
  TrangThaiChuyen,
  VeItem,
} from "../_data/chuyen";

export type TimelineState =
  | "done"
  | "current"
  | "pending"
  | "complete"
  | "cancelled";

export type StepState = "done" | "current" | "idle";

export type TimelineItem = {
  title: string;
  meta: string;
  state: TimelineState;
};

export type TicketFlag = { label: string; badgeClass: string };

export const LENH_STEPS: { key: string; label: string }[] = [
  { key: "nhan", label: "Nhận lệnh" },
  { key: "chuan-bi", label: "Chuẩn bị" },
  { key: "co-mat", label: "Có mặt tại bến" },
  { key: "chay", label: "Đang chạy" },
];

export const SUCO_STATE: Record<
  SucoTrangThai,
  { title: string; chip: string; chipClass: string }
> = {
  mo: {
    title: "Sự cố đang mở",
    chip: "Mở",
    chipClass: "bg-[var(--orange-100)] text-[var(--orange-700)]",
  },
  "dang-xu-ly": {
    title: "Sự cố đang xử lý",
    chip: "Đang xử lý",
    chipClass: "bg-[var(--sky-100)] text-[var(--sky-800)]",
  },
  "da-xu-ly": {
    title: "Sự cố đã xử lý",
    chip: "Đã xử lý",
    chipClass: "bg-[var(--green-100)] text-[var(--green-700)]",
  },
};

export const FOOT_NOTE: Record<TrangThaiChuyen, string> = {
  "sap-toi": "Có thể sửa hoặc hủy trước giờ khởi hành.",
  "dang-thuc-hien": "Chuyến đang chạy — xử lý qua báo sự cố.",
  "hoan-thanh": "Chuyến đã hoàn thành — chỉ xem thông tin.",
  "da-huy": "Chuyến đã hủy — không thể thao tác.",
};

/* Trạng thái 4 bước lệnh phân công (nhận → chuẩn bị → có mặt → chạy). */
export function lenhStepsFor(
  lenh: LenhPhanCong | null,
  trangThai: TrangThaiChuyen
): Record<string, StepState> {
  const out: Record<string, StepState> = {
    nhan: "idle",
    "chuan-bi": "idle",
    "co-mat": "idle",
    chay: "idle",
  };
  if (!lenh) return out;
  if (lenh === "chua-nhan") {
    out.nhan = "current";
    return out;
  }
  out.nhan = "done";
  if (lenh === "da-nhan") {
    out["chuan-bi"] = "current";
    return out;
  }
  out["chuan-bi"] = "done";
  if (trangThai === "dang-thuc-hien") {
    out["co-mat"] = "done";
    out.chay = "current";
  } else if (trangThai === "hoan-thanh") {
    out["co-mat"] = "done";
    out.chay = "done";
  } else {
    out["co-mat"] = "current";
  }
  return out;
}

/* Nhãn trạng thái của một vé (đặt/đón và thu tiền). */
export function ticketFlagBadges(ve: VeItem): TicketFlag[] {
  const flags: TicketFlag[] = [];
  if (ve.daHuy) {
    flags.push({ label: "Đã hủy", badgeClass: "badge--slate" });
  } else {
    flags.push({
      label: ve.daDon ? "Đã đón" : "Đã đặt",
      badgeClass: "badge--sky",
    });
  }
  flags.push({
    label: ve.daThu ? "Đã thu" : "Chưa thu",
    badgeClass: ve.daThu ? "badge--green" : "badge--slate",
  });
  return flags;
}

/* Biến thể thanh lấp ghế theo trạng thái chuyến + tỉ lệ đã đặt. */
export function seatBarVariant(trangThai: TrangThaiChuyen, tyLe: number) {
  if (trangThai === "da-huy") return "seat-bar-fill--muted";
  if (tyLe >= 100) return "seat-bar-fill--full";
  if (tyLe >= 70) return "seat-bar-fill--warn";
  return "";
}

const LAST_STEP: Record<TrangThaiChuyen, (timeText: string) => TimelineItem> = {
  "sap-toi": (timeText) => ({
    title: "Chờ khởi hành",
    meta: `Dự kiến ${timeText}`,
    state: "pending",
  }),
  "dang-thuc-hien": (timeText) => ({
    title: "Đang thực hiện",
    meta: `Bắt đầu ${timeText}`,
    state: "current",
  }),
  "hoan-thanh": () => ({
    title: "Đã hoàn thành",
    meta: "Kết thúc chuyến · đối soát tiền mặt ở Doanh thu",
    state: "complete",
  }),
  "da-huy": () => ({
    title: "Đã hủy chuyến",
    meta: "Vé liên quan đã hủy · không hoàn tiền",
    state: "cancelled",
  }),
};

/* Dựng lịch sử trạng thái của chuyến để component chỉ việc render. */
export function buildChuyenTimeline(
  trip: ChuyenRecord,
  ctx: {
    driverName: string | null;
    vehiclePlate: string | null;
    hasAssignment: boolean;
    timeText: string;
  }
): TimelineItem[] {
  const timeline: TimelineItem[] = [
    {
      title: "Đã tạo chuyến",
      meta: `${trip.taoLuc} · Quản trị viên`,
      state: "done",
    },
    ctx.hasAssignment
      ? {
          title: "Đã phân công xe + tài xế",
          meta: `${ctx.vehiclePlate} · ${ctx.driverName}`,
          state: "done",
        }
      : {
          title: "Chưa phân công xe + tài xế",
          meta: "Cần phân công trước khởi hành",
          state: "pending",
        },
    { title: "Đã công bố bán vé", meta: "Khách bắt đầu đặt", state: "done" },
  ];
  timeline.push(LAST_STEP[trip.trangThai](ctx.timeText));
  return timeline;
}
