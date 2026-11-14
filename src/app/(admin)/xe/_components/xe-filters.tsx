"use client";

import { Icon } from "@/components/icons/icon";
import { FormField, Select, TextInput } from "@/components/ui/form";
import { useXeFiltersStore } from "@/global-states/xe-filters-store";
import { XE_TRANG_THAI_OPTIONS } from "../_data/vehicles";

const GRID_CLASS = [
  "grid items-end gap-3.5",
  "[grid-template-columns:minmax(240px,1.4fr)_minmax(170px,0.8fr)_minmax(190px,0.9fr)_auto]",
  "max-[900px]:[grid-template-columns:1fr_1fr]",
  "max-[640px]:[grid-template-columns:1fr]",
].join(" ");

type XeFiltersProps = {
  filteredCount: number;
  totalCount: number;
  soChoOptions: number[];
};

export function XeFilters({
  filteredCount,
  totalCount,
  soChoOptions,
}: XeFiltersProps) {
  const search = useXeFiltersStore((s) => s.search);
  const soCho = useXeFiltersStore((s) => s.soCho);
  const trangThai = useXeFiltersStore((s) => s.trangThai);
  const setSearch = useXeFiltersStore((s) => s.setSearch);
  const setSoCho = useXeFiltersStore((s) => s.setSoCho);
  const setTrangThai = useXeFiltersStore((s) => s.setTrangThai);
  const reset = useXeFiltersStore((s) => s.reset);

  return (
    <section className="toolbar" aria-label="Bộ lọc danh sách xe">
      <div className={GRID_CLASS}>
        <FormField
          id="xe-search"
          label="Tìm kiếm"
          className="toolbar-search"
        >
          <TextInput
            id="xe-search"
            type="search"
            icon="i-search"
            placeholder="Tìm theo biển số hoặc mẫu xe..."
            autoComplete="off"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </FormField>

        <FormField id="xe-so-cho" label="Sức chứa">
          <Select
            id="xe-so-cho"
            value={soCho === null ? "" : String(soCho)}
            onChange={(value) => setSoCho(value ? Number(value) : null)}
            options={[
              { value: "", label: "Mọi sức chứa" },
              ...soChoOptions.map((option) => ({
                value: String(option),
                label: `${option} chỗ`,
              })),
            ]}
          />
        </FormField>

        <FormField id="xe-trang-thai" label="Tình trạng">
          <Select
            id="xe-trang-thai"
            value={trangThai}
            onChange={(value) => setTrangThai(value)}
            options={[
              { value: "", label: "Mọi tình trạng" },
              ...XE_TRANG_THAI_OPTIONS.map((option) => ({
                value: option,
                label: option,
              })),
            ]}
          />
        </FormField>

        <div className="toolbar-actions max-[900px]:col-span-full">
          <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
            <Icon name="i-refresh" />
            Xóa lọc
          </button>
        </div>
      </div>

      <p className="toolbar-count" role="status" aria-live="polite">
        Hiển thị {filteredCount}/{totalCount} xe
      </p>
    </section>
  );
}
