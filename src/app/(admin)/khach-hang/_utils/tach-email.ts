/* Tách email thành 2 phần để hiển thị 2 dòng: trước @ ở trên, sau @ ở dưới. */
export function tachEmail(email: string): { local: string; domain: string } {
  const at = email.lastIndexOf("@");
  if (at <= 0) return { local: email, domain: "" };
  return { local: email.slice(0, at), domain: email.slice(at + 1) };
}