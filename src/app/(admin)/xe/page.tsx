import type { Metadata } from "next";
import { XeBoard } from "./_components/xe-board";
import "./_components/xe.css";

export const metadata: Metadata = {
  title: "Quản lý xe — Vi Vu Việt",
  description:
    "Danh mục phương tiện Vi Vu Việt: biển số, loại xe, sức chứa, " +
    "tình trạng vận hành và cấu hình sơ đồ ghế, giấy tờ xe.",
};

export default async function XePage({}: PageProps<"/xe">) {
  return <XeBoard />;
}
