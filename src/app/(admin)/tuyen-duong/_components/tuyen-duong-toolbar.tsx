"use client";

import { Icon } from "@/components/icons/icon";
import { FormField, Select, TextInput } from "@/components/ui/form";
import {
  useTuyenDuongFiltersStore,
  type TuyenDuongTrangThaiFilter,
} from "@/global-states/tuyen-duong-filters-store";
import { TUYEN_DUONG_STATUS_OPTIONS } from "../_data/tuyen-duong";

const GRID_CLASS =
  "grid items-end gap-3.5 [grid-template-columns:minmax(240px,1fr)_minmax(190px,240px)_auto] max-[900px]:[grid-template-columns:1fr_1fr] max-[640px]:[grid-template-columns:1fr]";

type TuyenDuongToolbarProps = {
  countText: string;
};

export function TuyenDuongToolbar({ countText }: TuyenDuongToolbarProps) {
  const search = useTuyenDuongFiltersStore((s) => s.search);
  const trangThai = useTuyenDuongFiltersStore((s) => s.trangThai);
  const setSearch = useTuyenDuongFiltersStore((s) => s.setSearch);
  const setTrangThai = useTuyenDuongFiltersStore((s) => s.setTrangThai);
  const reset = useTuyenDuongFiltersStore((s) => s.reset);

  return (
    <section className="toolbar td-toolbar" aria-label="Lọc danh sách tuyến">
      <div className={GRID_CLASS}>
        <FormField id="td-search" label="Tìm kiếm" className="toolbar-search">
          <TextInput
            id="td-search"
            type="search"
            icon="i-search"
            placeholder="Mã tuyến, điểm đi, điểm đến..."
            autoComplete="off"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </FormField>

        <FormField id="td-trang-thai" label="Trạng thái">
          <Select
            id="td-trang-thai"
            value={trangThai}
            onChange={(value) =>
              setTrangThai(value as TuyenDuongTrangThaiFilter)
            }
            options={[
              { value: "", label: "Mọi trạng thái" },
              ...TUYEN_DUONG_STATUS_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              })),
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
        {countText}
      </p>
    </section>
  );
}
