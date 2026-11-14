import type {
  ChuyenRecord,
  LenhPhanCong,
  SucoTrangThai,
  TrangThaiChuyen,
  VeItem,
} from "../_data/chuyen";

import type { TripDetailHistoryItem } from "@/api/chuyen/api/types";

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
  if (trip.trangThai === "da-huy") {
    const parts: string[] = [];
    if (trip.huyLuc) parts.push(`Hủy lúc ${trip.huyLuc}`);
    if (trip.lyDoHuy) parts.push(trip.lyDoHuy);
    if (parts.length > 0) {
      const last = timeline[timeline.length - 1];
      last.meta = `${parts.join(" · ")} · vé liên quan đã hủy`;
    }
  }
  return timeline;
}

const pad2 = (value: number) => String(value).padStart(2, "0");

/* Mốc ISO (LocalDateTime) → "dd/mm · HH:mm" theo giờ địa phương. */
const mocThoiGian = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)} · ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

/* Trạng thái mốc lịch sử backend (DONE/PENDING) → biến thể dot trên UI. */
const HISTORY_STATE = (item: TripDetailHistoryItem): TimelineState => {
  if (item.state !== "DONE") return "pending";
  const key = item.eventType.toUpperCase();
  if (key.includes("CANCEL")) return "cancelled";
  if (key.includes("COMPLETE")) return "complete";
  return "done";
};

/*
 * Lịch sử trạng thái thật của backend (TripDetailResponse.history) → timeline UI.
 * Mốc đã xảy ra dùng thời điểm thật; mốc chờ dùng expectedAt (nếu có).
 */
export function mapHistoryTimeline(
  history: TripDetailHistoryItem[]
): TimelineItem[] {
  return history.map((item) => {
    const occurred = mocThoiGian(item.occurredAt);
    const expected = mocThoiGian(item.expectedAt);
    const who = item.actorName ?? item.description ?? null;
    const meta =
      item.state === "DONE"
        ? [occurred, who].filter(Boolean).join(" · ") || "—"
        : `Dự kiến ${expected ?? "—"}`;
    return {
      title: item.title ?? item.eventType,
      meta,
      state: HISTORY_STATE(item),
    };
  });
}
