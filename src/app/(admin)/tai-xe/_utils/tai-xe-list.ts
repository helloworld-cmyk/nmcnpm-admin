/* Số tài xế mỗi trang gửi lên backend. */
export const TAI_XE_PAGE_SIZE = 8;

/* Tổng số trang từ tổng số phần tử; luôn tối thiểu 1 trang. */
export function computePageCount(
  totalElements: number,
  size = TAI_XE_PAGE_SIZE
): number {
  return Math.max(1, Math.ceil(totalElements / size));
}
