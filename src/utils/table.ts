/* Một ô số trang: số trang hoặc dấu "gap" (…) ngăn cách. */
export type PageItem = number | "gap";

/*
 * Dãy số trang cho thanh phân trang: luôn có trang đầu, trang cuối và các
 * trang quanh trang hiện tại; chèn "gap" khi có khoảng bị lược bỏ.
 * Khi tổng số trang ≤ 6 thì liệt kê đủ, không rút gọn.
 */
export function pageIndexes(pageCount: number, page: number): PageItem[] {
  if (pageCount <= 6) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }
  const wanted = Array.from(new Set([1, page - 1, page, page + 1, pageCount]))
    .filter((item) => item >= 1 && item <= pageCount)
    .sort((a, b) => a - b);
  const result: PageItem[] = [];
  let previous = 0;
  for (const item of wanted) {
    if (item - previous > 1) result.push("gap");
    result.push(item);
    previous = item;
  }
  return result;
}
