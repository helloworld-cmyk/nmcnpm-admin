"use client";

import { Icon } from "@/components/icons/icon";
import { useTaiXeFiltersStore } from "@/global-states/tai-xe-filters-store";

const STATE_CLASS =
  "state-empty mb-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface)]";

export function TaiXeEmptyState() {
  const reset = useTaiXeFiltersStore((s) => s.reset);

  return (
    <section aria-label="Không có kết quả" className={STATE_CLASS}>
      <span className="state-empty-icon">
        <Icon name="i-users" />
      </span>
      <h3>Không có tài xế phù hợp</h3>
      <p>
        Thử đổi từ khóa tìm kiếm hoặc chọn trạng thái khác để xem toàn bộ đội
        tài xế hiện có.
      </p>
      <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
        Xóa bộ lọc
      </button>
    </section>
  );
}
