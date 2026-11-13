"use client";

import { DatePicker, FormField, Select } from "@/components/ui/form";
import {
  DOANH_THU_PERIOD_OPTIONS,
  useDoanhThuStore,
  type DoanhThuPeriod,
} from "@/global-states/doanh-thu-store";

const FIELD_CLASS = "min-w-[150px] max-[640px]:w-full max-[640px]:min-w-0";

export function PeriodFilter() {
  const period = useDoanhThuStore((s) => s.period);
  const from = useDoanhThuStore((s) => s.from);
  const to = useDoanhThuStore((s) => s.to);
  const setPeriod = useDoanhThuStore((s) => s.setPeriod);
  const setCustomRange = useDoanhThuStore((s) => s.setCustomRange);

  return (
    <section aria-labelledby="bo-loc-title">
      <h2 className="sr-only" id="bo-loc-title">
        Chọn kỳ doanh thu
      </h2>

      <form
        className="admin-card flex flex-wrap items-end gap-3.5 p-[18px_20px] max-[640px]:p-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className={FIELD_CLASS}>
          <FormField id="dtPeriod" label="Kỳ thống kê">
            <Select
              id="dtPeriod"
              value={period}
              onChange={(value) => setPeriod(value as DoanhThuPeriod)}
              options={DOANH_THU_PERIOD_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
            />
          </FormField>
        </div>

        <div className={FIELD_CLASS}>
          <FormField id="dtFrom" label="Từ ngày">
            <DatePicker
              id="dtFrom"
              value={from}
              onChange={(value) => setCustomRange(value, to)}
            />
          </FormField>
        </div>

        <div className={FIELD_CLASS}>
          <FormField id="dtTo" label="Đến ngày">
            <DatePicker
              id="dtTo"
              value={to}
              onChange={(value) => setCustomRange(from, value)}
            />
          </FormField>
        </div>
      </form>
    </section>
  );
}