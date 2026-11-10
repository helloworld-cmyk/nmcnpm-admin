"use client";

import { useEffect } from "react";
import { useMyCompanies } from "@/api/company/tanstack/use-my-companies";
import { useCompanyStore } from "@/global-states/company-store";

/**
 * Đồng bộ "hãng đang quản lý" với danh sách hãng của tài khoản (/me/companies).
 * - Khôi phục companyId đã lưu trong storage.
 * - Tự chọn hãng đầu tiên khi chưa có lựa chọn hoặc lựa chọn không còn hợp lệ.
 * Render rỗng; đặt trong layout khu vực quản trị.
 */
export function CompanyBootstrap() {
  const hydrated = useCompanyStore((s) => s.hydrated);
  const companyId = useCompanyStore((s) => s.companyId);
  const hydrate = useCompanyStore((s) => s.hydrate);
  const setCompanyId = useCompanyStore((s) => s.setCompanyId);

  const { data: companies } = useMyCompanies();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated || !companies) return;
    const stillValid =
      companyId !== null && companies.some((c) => c.companyId === companyId);
    if (stillValid) return;
    setCompanyId(companies[0]?.companyId ?? null);
  }, [hydrated, companies, companyId, setCompanyId]);

  return null;
}
