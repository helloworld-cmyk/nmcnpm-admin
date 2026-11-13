import type { Metadata } from "next";
import { KhachHangBoard } from "./_components/khach-hang-board";
import "./_components/khach-hang.css";

export const metadata: Metadata = {
  title: "Quản lý khách hàng — Vi Vu Việt",
  description:
    "Tra cứu tài khoản khách, xem chi tiết và lịch sử vé.",
};

export default async function KhachHangPage({}: PageProps<"/khach-hang">) {
  return <KhachHangBoard />;
}
