export function formatVND(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

export function formatMillions(value: number) {
  return (value / 1000000).toLocaleString("vi-VN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}