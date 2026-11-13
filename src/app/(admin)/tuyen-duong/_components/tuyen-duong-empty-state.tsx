"use client";

import { Icon } from "@/components/icons/icon";
import { useTuyenDuongFiltersStore } from "@/global-states/tuyen-duong-filters-store";

const STATE_CLASS =
  "state-empty mb-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface)]";

export function TuyenDuongEmptyState() {
  const reset = useTuyenDuongFiltersStore((s) => s.reset);

  return (
    <section aria-label="Không có kết quả" className={STATE_CLASS}>
      <span className="state-empty-icon">
        <Icon name="i-search" />
      </span>
      <h3>Không tìm thấy tuyến phù hợp</h3>
      <p>
        Không có tuyến nào khớp với từ khóa và trạng thái đang lọc. Thử từ khóa
        khác hoặc đặt lại bộ lọc để xem toàn bộ danh mục.
      </p>
      <button type="button" className="btn btn-ghost" onClick={reset}>
        Đặt lại bộ lọc
      </button>
    </section>
  );
}
