"use client";

import { Icon } from "@/components/icons/icon";
import { useXeFiltersStore } from "@/global-states/xe-filters-store";

const STATE_CLASS = [
  "state-empty mb-2 rounded-[var(--radius-md)]",
  "border border-dashed border-[var(--border)]",
  "bg-[var(--surface)]",
].join(" ");

export function XeEmptyState() {
  const reset = useXeFiltersStore((s) => s.reset);

  return (
    <section aria-label="Không có kết quả" className={STATE_CLASS}>
      <span className="state-empty-icon">
        <Icon name="i-car" />
      </span>
      <h3>Không có xe nào khớp bộ lọc</h3>
      <p>Thử đổi từ khóa tìm kiếm hoặc xóa bộ lọc để xem toàn bộ đội xe.</p>
      <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
        Xóa lọc
      </button>
    </section>
  );
}
