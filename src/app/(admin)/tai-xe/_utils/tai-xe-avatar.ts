/* Bảng màu avatar xoay vòng theo id tài xế. */
const TINTS = ["sky", "orange", "green"] as const;

/* Chọn màu avatar ổn định theo id (băm mã ký tự). */
export function tintFor(id: string): (typeof TINTS)[number] {
  let hash = 0;
  for (const char of id) hash = (hash + char.charCodeAt(0)) % TINTS.length;
  return TINTS[hash];
}
