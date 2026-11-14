import type { Metadata } from "next";
import { DonDatBoard } from "./_components/don-dat-board";
import "./_components/don-dat.css";

export const metadata: Metadata = {
  title: "Quản lý đơn đặt — Vi Vu Việt",
};

export default async function DonDatPage({ searchParams }: PageProps<"/don-dat">) {
  /* Hỗ trợ link /don-dat?customerId=...&viewStatus=... từ màn Khách hàng. */
  const params = await searchParams;
  const rawCustomer = params.customerId;
  const rawViewStatus = params.viewStatus;
  const initialCustomerId = (Array.isArray(rawCustomer) ? rawCustomer[0] : rawCustomer)?.trim() ?? "";
  const initialViewStatus =
    (Array.isArray(rawViewStatus) ? rawViewStatus[0] : rawViewStatus)?.trim() ?? "";

  return (
    <DonDatBoard
      initialCustomerId={initialCustomerId}
      initialViewStatus={initialViewStatus}
    />
  );
}
