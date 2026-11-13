export type TuyenDuong = {
  id: string;
  code: string;
  from: string;
  to: string;
  km: number;
  min: number;
  price: number;
  active: boolean;
  trips: number;
  updated: string;
};

export type TuyenDuongFormValues = {
  code: string;
  originAreaId: string;
  destinationAreaId: string;
  km: number;
  min: number;
  price: number;
};

export const TUYEN_DUONG_STATUS_OPTIONS = [
  { value: "active", label: "Đang chạy" },
  { value: "paused", label: "Tạm dừng" },
] as const;

export function formatMoney(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

export function formatDuration(min: number) {
  const hours = Math.floor(min / 60);
  const minutes = min % 60;
  return minutes
    ? `${hours}h${String(minutes).padStart(2, "0")}`
    : `${hours}h`;
}

export function nextRouteCode(codes: string[]) {
  const max = codes.reduce((current, code) => {
    const number = Number(code.replace("TUY-", ""));
    return Number.isFinite(number) && number > current ? number : current;
  }, 0);
  return `TUY-${String(max + 1).padStart(2, "0")}`;
}
