import type { DoanhThuDay } from "../_utils/map-report";

export function formatVND(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

export function formatMillions(value: number) {
  return (value / 1000000).toLocaleString("vi-VN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* Tạo CSV doanh thu theo ngày để tải về máy. */
export function buildDailyCsv(days: DoanhThuDay[]) {
  const escape = (cell: string | number) => {
    const text = String(cell);
    return /[",;\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const lines: string[] = [["Ngày", "Doanh thu (đ)"].map(escape).join(";")];

  for (const day of days) {
    lines.push([day.label, day.vnd].map(escape).join(";"));
  }

  const total = days.reduce((sum, day) => sum + day.vnd, 0);
  lines.push(["Tổng", total].map(escape).join(";"));

  return `\uFEFF${lines.join("\r\n")}`;
}
