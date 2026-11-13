import type { Metadata } from "next";
import { XeBoard } from "./_components/xe-board";
import "./_components/xe.css";

export const metadata: Metadata = {
  title: "Quản lý xe — Vi Vu Việt",
  description:
    "Danh mục phương tiện Vi Vu Việt: biển số, sức chứa, tài xế phụ trách, " +
    "tình trạng vận hành và hạn giấy tờ.",
};

export default async function XePage({}: PageProps<"/xe">) {
  return <XeBoard />;
}
