import type { Metadata } from "next";
import { AdminIconSprite } from "@/components/icons/sprite";
import { AdminShell } from "@/components/layout/admin-shell";
import { SessionGate } from "@/components/layout/session-gate";

export const metadata: Metadata = {
  title: "Quản trị — Vi Vu Việt",
  description:
    "Khu vực quản trị Vi Vu Việt: chuyến đi, đơn đặt, tài xế, xe, tuyến đường, khách hàng và doanh thu.",
};

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AdminIconSprite />
      <SessionGate>
        <AdminShell>{children}</AdminShell>
      </SessionGate>
    </>
  );
}
