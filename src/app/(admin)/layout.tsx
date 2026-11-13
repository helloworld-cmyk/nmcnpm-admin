import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/admin-shell";
import { CompanyBootstrap } from "@/components/layout/company-bootstrap";
import { SessionGate } from "@/components/layout/session-gate";

export const metadata: Metadata = {
  title: "Quản trị — Vi Vu Việt",
  description:
    "Khu vực quản trị Vi Vu Việt: chuyến đi, đơn đặt, tài xế, xe, tuyến đường, khách hàng và doanh thu.",
};

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SessionGate>
        <CompanyBootstrap />
        <AdminShell>{children}</AdminShell>
      </SessionGate>
    </>
  );
}
