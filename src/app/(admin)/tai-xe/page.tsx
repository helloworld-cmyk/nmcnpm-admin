import type { Metadata } from "next";
import { TaiXeBoard } from "./_components/tai-xe-board";
import "./_components/tai-xe.css";

export const metadata: Metadata = {
  title: "Quản lý tài xế — Vi Vu Việt",
  description:
    "Danh mục tài xế Vi Vu Việt: liên hệ, giấy phép lái xe, số chuyến 30 ngày và trạng thái tài khoản.",
};

export default async function TaiXePage({}: PageProps<"/tai-xe">) {
  return <TaiXeBoard />;
}
