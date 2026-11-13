import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { TongQuanDashboard } from "./_components/tong-quan-dashboard";
import "./_components/tong-quan.css";

export const metadata: Metadata = {
  title: "Tổng quan — Quản trị Vi Vu Việt",
  description:
    "Bảng điều khiển quản trị Vi Vu Việt: KPI chuyến đi, doanh thu, tài xế và các cảnh báo vận hành.",
};

export default function TongQuanPage({}: PageProps<"/tong-quan">) {
  return (
    <Reveal>
      <TongQuanDashboard />
    </Reveal>
  );
}
