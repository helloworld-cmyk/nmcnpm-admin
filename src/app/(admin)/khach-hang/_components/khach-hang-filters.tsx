"use client";

import { Icon } from "@/components/icons/icon";
import { FormField, Select, TextInput } from "@/components/ui/form";
import { useKhachHangFiltersStore } from "@/global-states/khach-hang-filters-store";

const GRID_CLASS =
  "grid items-end gap-3.5 [grid-template-columns:minmax(240px,1fr)_minmax(190px,240px)_auto] max-[900px]:[grid-template-columns:1fr_1fr] max-[640px]:[grid-template-columns:1fr]";

type KhachHangFiltersProps = {
  filteredCount: number;
  page: number;
  pageCount: number;
};

export function KhachHangFilters({
  filteredCount,
  page,
  pageCount,
}: KhachHangFiltersProps) {
  const search = useKhachHangFiltersStore((s) => s.search);
  const trangThai = useKhachHangFiltersStore((s) => s.trangThai);
  const setSearch = useKhachHangFiltersStore((s) => s.setSearch);
  const setTrangThai = useKhachHangFiltersStore((s) => s.setTrangThai);
  const reset = useKhachHangFiltersStore((s) => s.reset);

  return (
    <section
      className="toolbar kh-toolbar"
      aria-label="Bộ lọc danh sách khách hàng"
    >
      <div className={GRID_CLASS}>
        <FormField id="kh-search" label="Tìm kiếm" className="toolbar-search">
          <TextInput
            id="kh-search"
            type="search"
            icon="i-search"
            placeholder="Tên khách, SĐT hoặc email..."
            autoComplete="off"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </FormField>

        <FormField id="kh-trang-thai" label="Trạng thái tài khoản">
          <Select
            id="kh-trang-thai"
            value={trangThai}
            onChange={(value) => setTrangThai(value)}
            options={[
              { value: "", label: "Mọi trạng thái" },
              { value: "active", label: "Đang hoạt động" },
              { value: "locked", label: "Bị khóa" },
            ]}
          />
        </FormField>

        <div className="toolbar-actions max-[900px]:col-span-full">
          <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
            <Icon name="i-refresh" />
            Đặt lại bộ lọc
          </button>
        </div>
      </div>

      <p className="toolbar-count" role="status" aria-live="polite">
        {filteredCount === 0
          ? "Không có tài khoản nào khớp bộ lọc"
          : `Tìm thấy ${filteredCount} tài khoản · trang ${page}/${pageCount}`}
      </p>
    </section>
  );
}
