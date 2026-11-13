import type { Metadata } from "next";
import { TuyenDuongBoard } from "./_components/tuyen-duong-board";
import "./_components/tuyen-duong.css";

export const metadata: Metadata = {
  title: "Quản lý tuyến — Vi Vu Việt",
  description:
    "Danh mục tuyến xe ghép Vi Vu Việt: điểm đi – điểm đến và giá vé cơ bản dùng khi tạo chuyến.",
};

export default async function TuyenDuongPage({}: PageProps<"/tuyen-duong">) {
  return <TuyenDuongBoard />;
}
