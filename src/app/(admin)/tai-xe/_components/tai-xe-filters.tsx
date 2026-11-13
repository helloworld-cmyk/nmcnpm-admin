"use client";

import { Icon } from "@/components/icons/icon";
import { FormField, Select, TextInput } from "@/components/ui/form";
import type { CompanyDriverStatus } from "@/api/tai-xe/api/types";
import { useTaiXeFiltersStore } from "@/global-states/tai-xe-filters-store";
import { TRANG_THAI_TAI_XE_OPTIONS } from "../_utils/tai-xe";

const GRID_CLASS = [
  "grid items-end gap-3.5",
  "[grid-template-columns:minmax(240px,1.6fr)_minmax(190px,0.9fr)_auto]",
  "max-[760px]:[grid-template-columns:1fr_1fr]",
  "max-[520px]:[grid-template-columns:1fr]",
].join(" ");

type TaiXeFiltersProps = {
  totalCount: number;
};

export function TaiXeFilters({ totalCount }: TaiXeFiltersProps) {
  const search = useTaiXeFiltersStore((s) => s.search);
  const trangThai = useTaiXeFiltersStore((s) => s.trangThai);
  const setSearch = useTaiXeFiltersStore((s) => s.setSearch);
  const setTrangThai = useTaiXeFiltersStore((s) => s.setTrangThai);
  const reset = useTaiXeFiltersStore((s) => s.reset);

  return (
    <section className="toolbar tx-toolbar" aria-label="Bộ lọc danh sách tài xế">
      <div className={GRID_CLASS}>
        <FormField id="tx-search" label="Tìm kiếm" className="toolbar-search">
          <TextInput
            id="tx-search"
            type="search"
            icon="i-search"
            placeholder="Tên, SĐT hoặc email tài xế..."
            autoComplete="off"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </FormField>

        <FormField id="tx-trang-thai" label="Trạng thái">
          <Select
            id="tx-trang-thai"
            value={trangThai}
            onChange={(value) =>
              setTrangThai(value as CompanyDriverStatus | "")
            }
            options={[
              { value: "", label: "Tất cả trạng thái" },
              ...TRANG_THAI_TAI_XE_OPTIONS,
            ]}
          />
        </FormField>

        <div className="toolbar-actions max-[760px]:col-span-full">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={reset}
          >
            <Icon name="i-refresh" />
            Đặt lại
          </button>
        </div>
      </div>

      <p className="toolbar-count" role="status" aria-live="polite">
        {totalCount} tài xế
      </p>
    </section>
  );
}
