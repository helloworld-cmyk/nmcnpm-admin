import type { Metadata } from "next";
import { ChuyenBoard } from "./_components/chuyen-board";
import "./_components/chuyen.css";

export const metadata: Metadata = {
  title: "Quản lý chuyến — Vi Vu Việt",
};

export default function ChuyenPage({}: PageProps<"/chuyen">) {
  return <ChuyenBoard />;
}
