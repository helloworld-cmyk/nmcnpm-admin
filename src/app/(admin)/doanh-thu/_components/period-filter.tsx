"use client";

import { Icon } from "@/components/icons/icon";
import { DatePicker, FormField, Select } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import {
  DOANH_THU_PERIOD_OPTIONS,
  useDoanhThuStore,
  type DoanhThuPeriod,
} from "@/global-states/doanh-thu-store";
import { useDoanhThuExport } from "../_hooks/use-doanh-thu-export";
import { useDoanhThuReport } from "../_hooks/use-doanh-thu-report";

const FIELD_CLASS = "min-w-[150px] max-[640px]:w-full max-[640px]:min-w-0";

export function PeriodFilter() {
  const period = useDoanhThuStore((s) => s.period);
  const from = useDoanhThuStore((s) => s.from);
  const to = useDoanhThuStore((s) => s.to);
  const setPeriod = useDoanhThuStore((s) => s.setPeriod);
  const setCustomRange = useDoanhThuStore((s) => s.setCustomRange);

  const { report } = useDoanhThuReport();
  const { exportOpen, openExport, closeExport, status, exportCsv } =
    useDoanhThuExport(report);

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

        <div className="ml-auto flex items-center gap-2.5 max-[640px]:ml-0 max-[640px]:w-full">
          <button
            type="button"
            className="btn btn-ghost btn-sm max-[640px]:flex-1"
            onClick={openExport}
            disabled={!report}
          >
            <Icon name="i-download" className="icon" />
            Xuất CSV
          </button>
        </div>

        {status !== null && (
          <p
            className="w-full text-[12.5px] font-semibold text-[var(--green-700)]"
            role="status"
            aria-live="polite"
          >
            {status}
          </p>
        )}
      </form>

      <Modal
        open={exportOpen}
        onClose={closeExport}
        title="Xuất báo cáo doanh thu"
        size="sm"
        footer={
          <>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={closeExport}
            >
              Huỷ
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={exportCsv}
            >
              Xuất CSV
            </button>
          </>
        }
      >
        <p className="text-[13.5px] leading-[1.65] text-[var(--slate-600)]">
          Báo cáo doanh thu theo ngày cho kỳ{" "}
          <strong className="text-[var(--ink)]">
            {report?.rangeLabel ?? "—"}
          </strong>
          {report ? `, gồm ${report.days.length} ngày có phát sinh` : ""}. Tệp
          CSV sẽ được tải về máy.
        </p>
      </Modal>
    </section>
  );
}
