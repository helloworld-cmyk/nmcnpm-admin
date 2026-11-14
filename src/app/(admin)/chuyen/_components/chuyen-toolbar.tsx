"use client";

import { Icon } from "@/components/icons/icon";
import { DatePicker, FormField, Select, TextInput } from "@/components/ui/form";
import { useChuyenFiltersStore } from "@/global-states/chuyen-filters-store";
import {
  TAIXE_FILTER_ALL,
  TAIXE_FILTER_UNASSIGNED,
  TRANG_THAI_OPTIONS,
  type TaiXeOption,
} from "../_data/chuyen";

const TAB_BASE_CLASS =
  "inline-flex min-h-[44px] items-center gap-2 rounded-[10px] px-3.5 py-2 text-[13.5px] font-semibold transition-colors duration-[var(--dur)] ease-[var(--ease)]";

const TAB_ACTIVE_CLASS = "bg-[var(--sky-700)] text-white";

const TAB_INACTIVE_CLASS =
  "text-[var(--slate-600)] hover:bg-[var(--sky-50)] hover:text-[var(--sky-700)]";

const TAB_COUNT_CLASS =
  "inline-grid min-w-[22px] place-items-center rounded-full bg-[var(--slate-200)] px-[7px] py-0.5 text-[11.5px] font-bold text-[var(--slate-600)]";

const TAB_COUNT_ACTIVE_CLASS = "bg-white/25 text-white";

type ChuyenToolbarProps = {
  counts: Record<string, number>;
  tuyenOptions: { value: string; label: string }[];
  taixeOptions: TaiXeOption[];
  onReset: () => void;
};

export function ChuyenToolbar({
  counts,
  tuyenOptions,
  taixeOptions,
  onReset,
}: ChuyenToolbarProps) {
  const view = useChuyenFiltersStore((s) => s.view);
  const tab = useChuyenFiltersStore((s) => s.tab);
  const filters = useChuyenFiltersStore((s) => s.filters);
  const setView = useChuyenFiltersStore((s) => s.setView);
  const setTab = useChuyenFiltersStore((s) => s.setTab);
  const setFilter = useChuyenFiltersStore((s) => s.setFilter);

  const isBang = view === "bang";

  return (
    <section className="toolbar" aria-label="Chế độ xem và bộ lọc chuyến">
      <div className="flex flex-wrap items-center gap-3">
        <div className="cv-switch" role="group" aria-label="Chế độ xem">
          <button
            type="button"
            className={`cv-switch-btn${isBang ? " is-active" : ""}`}
            aria-pressed={isBang}
            onClick={() => setView("bang")}
          >
            <Icon name="i-list" />
            Bảng
          </button>
          <button
            type="button"
            className={`cv-switch-btn${isBang ? "" : " is-active"}`}
            aria-pressed={!isBang}
            onClick={() => setView("lich")}
          >
            <Icon name="i-grid" />
            Lịch điều phối
          </button>
        </div>
      </div>

      {isBang && (
        <>
          <div
            role="tablist"
            aria-label="Lọc theo trạng thái chuyến"
            className="flex flex-wrap gap-1 border-b border-[var(--border-soft)] pb-3"
          >
            {TRANG_THAI_OPTIONS.map((item) => {
              const active = tab === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(item.value)}
                  className={`${TAB_BASE_CLASS} ${active ? TAB_ACTIVE_CLASS : TAB_INACTIVE_CLASS}`}
                >
                  {item.label}
                  <span
                    className={`${TAB_COUNT_CLASS}${active ? ` ${TAB_COUNT_ACTIVE_CLASS}` : ""}`}
                  >
                    {counts[item.value] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 items-end gap-3 min-[641px]:grid-cols-2 min-[1181px]:grid-cols-[minmax(220px,1.3fr)_repeat(3,minmax(150px,0.9fr))_auto]">
            <FormField
              id="fTim"
              label="Tìm kiếm"
              className="min-[641px]:col-span-2 min-[1181px]:col-span-1"
            >
              <TextInput
                id="fTim"
                name="tim"
                type="search"
                icon="i-search"
                placeholder="Mã chuyến, tuyến, tài xế..."
                autoComplete="off"
                value={filters.search}
                onChange={(event) => setFilter("search", event.target.value)}
              />
            </FormField>

            <FormField id="fNgayLoc" label="Ngày">
              <DatePicker
                id="fNgayLoc"
                icon="i-calendar"
                value={filters.ngay}
                onChange={(value) => setFilter("ngay", value)}
                placeholder="Mọi ngày"
              />
            </FormField>

            <FormField id="fTuyenLoc" label="Tuyến">
              <Select
                id="fTuyenLoc"
                name="tuyen"
                icon="i-route"
                value={filters.tuyen}
                onChange={(value) => setFilter("tuyen", value)}
                options={[
                  { value: "all", label: "Tất cả tuyến" },
                  ...tuyenOptions.map((option) => ({
                    value: option.value,
                    label: option.label,
                  })),
                ]}
              />
            </FormField>

            <FormField id="fTxLoc" label="Tài xế">
              <Select
                id="fTxLoc"
                name="taixe"
                icon="i-user"
                value={filters.taixe}
                onChange={(value) => setFilter("taixe", value)}
                options={[
                  { value: TAIXE_FILTER_ALL, label: "Mọi tài xế" },
                  ...taixeOptions.map((option) => ({
                    value: option.value,
                    label: option.label,
                  })),
                  {
                    value: TAIXE_FILTER_UNASSIGNED,
                    label: "Chưa phân công",
                  },
                ]}
              />
            </FormField>

            <div className="flex items-end min-[641px]:col-span-2 min-[1181px]:col-span-1">
              <button
                type="button"
                className="btn btn-ghost btn-sm w-full min-[641px]:w-auto"
                onClick={onReset}
              >
                <Icon name="i-refresh" />
                Đặt lại
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
