import type { Metadata } from "next";
import { DonDatBoard } from "./_components/don-dat-board";
import "./_components/don-dat.css";

export const metadata: Metadata = {
  title: "Quản lý đơn đặt — Vi Vu Việt",
};

export default function DonDatPage({}: PageProps<"/don-dat">) {
  return <DonDatBoard />;
}
