"use client";

import { Icon } from "@/components/icons/icon";
import { DatePicker, FormField, TextInput } from "@/components/ui/form";
import type { CompanyBookingStatusCountsResponse } from "@/api/don-dat/api/types";
import { useDonDatFiltersStore } from "@/global-states/don-dat-filters-store";
import { DON_DAT_TABS } from "../_data/don-dat";

const TAB_BASE_CLASS =
  "inline-flex min-h-[44px] items-center gap-2 rounded-[10px] px-3.5 py-2 text-[13.5px] font-semibold transition-colors duration-[var(--dur)] ease-[var(--ease)]";

const TAB_ACTIVE_CLASS = "bg-[var(--sky-700)] text-white";

const TAB_INACTIVE_CLASS =
  "text-[var(--slate-600)] hover:bg-[var(--sky-50)] hover:text-[var(--sky-700)]";

const TAB_COUNT_CLASS =
  "inline-grid min-w-[22px] place-items-center rounded-full bg-[var(--slate-200)] px-[7px] py-0.5 text-[11.5px] font-bold text-[var(--slate-600)]";

const TAB_COUNT_ACTIVE_CLASS = "bg-white/25 text-white";

type DonDatToolbarProps = {
  counts: CompanyBookingStatusCountsResponse | null;
  customerId: string | null;
  customerName: string;
  customerLoading: boolean;
  onClearCustomer: () => void;
  onReset: () => void;
};

export function DonDatToolbar({
  counts,
  customerId,
  customerName,
  customerLoading,
  onClearCustomer,
  onReset,
}: DonDatToolbarProps) {
  const tab = useDonDatFiltersStore((s) => s.tab);
  const search = useDonDatFiltersStore((s) => s.search);
  const departureFrom = useDonDatFiltersStore((s) => s.departureFrom);
  const departureTo = useDonDatFiltersStore((s) => s.departureTo);
  const setTab = useDonDatFiltersStore((s) => s.setTab);
  const setSearch = useDonDatFiltersStore((s) => s.setSearch);
  const setDepartureRange = useDonDatFiltersStore((s) => s.setDepartureRange);

  return (
    <section className="toolbar" aria-label="Bộ lọc đơn đặt">
      {customerId ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-[10px] border border-[var(--border-soft)] bg-[var(--sky-50)] px-3 py-2">
          <Icon name="i-user" className="icon h-4 w-4 text-[var(--sky-700)]" />
          <span className="text-[12.5px] font-semibold text-[var(--sky-800)]">
            {customerLoading
              ? "Đang tải thông tin khách..."
              : `Đơn của ${customerName || "khách hàng đã chọn"}`}
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClearCustomer}
          >
            <Icon name="i-close" className="icon h-3.5 w-3.5" />
            Bỏ lọc
          </button>
        </div>
      ) : null}

      <div
        role="tablist"
        aria-label="Lọc đơn theo trạng thái"
        className="flex flex-wrap gap-1 border-b border-[var(--border-soft)] pb-3"
      >
        {DON_DAT_TABS.map((item) => {
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
                {counts ? counts[item.value] : 0}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 items-end gap-3 min-[641px]:grid-cols-2 min-[1181px]:grid-cols-[minmax(260px,1.4fr)_repeat(2,minmax(160px,1fr))_auto]">
        <FormField
          id="ddTim"
          label="Tìm kiếm"
          className="min-[641px]:col-span-2 min-[1181px]:col-span-1"
        >
          <TextInput
            id="ddTim"
            name="tim"
            type="search"
            icon="i-search"
            placeholder="Mã đơn, tên, SĐT khách, mã chuyến..."
            autoComplete="off"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </FormField>

        <FormField id="ddTu" label="Khởi hành từ">
          <DatePicker
            id="ddTu"
            value={departureFrom}
            onChange={(value) => setDepartureRange(value, departureTo)}
          />
        </FormField>

        <FormField id="ddDen" label="Khởi hành đến">
          <DatePicker
            id="ddDen"
            value={departureTo}
            min={departureFrom || undefined}
            onChange={(value) => setDepartureRange(departureFrom, value)}
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
    </section>
  );
}
