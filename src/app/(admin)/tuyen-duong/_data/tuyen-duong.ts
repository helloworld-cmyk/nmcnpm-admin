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

const CODE_SEQUENCE = /^(.*?)(\d+)$/;

function matchCodeSequence(
  code: string
): { prefix: string; number: number; width: number } | null {
  const match = CODE_SEQUENCE.exec(code);
  if (!match) return null;
  const number = Number(match[2]);
  if (!Number.isFinite(number)) return null;
  return { prefix: match[1], number, width: match[2].length };
}

export function nextRouteCode(codes: string[]) {
  const normalized = codes.map((code) => code.trim().toUpperCase());
  const taken = new Set(normalized);
  const sequences = normalized.flatMap((code) => {
    const match = matchCodeSequence(code);
    return match ? [match] : [];
  });
  const tuyenSequences = sequences.filter((seq) => seq.prefix === "TUY-");
  const base = (tuyenSequences.length > 0 ? tuyenSequences : sequences).reduce<{
    prefix: string;
    number: number;
    width: number;
  } | null>(
    (best, seq) => (best === null || seq.number > best.number ? seq : best),
    null
  );

  const prefix = base?.prefix ?? "TUY-";
  const width = base?.width ?? 2;
  let next = (base?.number ?? 0) + 1;
  let candidate = `${prefix}${String(next).padStart(width, "0")}`;
  while (taken.has(candidate)) {
    next += 1;
    candidate = `${prefix}${String(next).padStart(width, "0")}`;
  }
  return candidate;
}
