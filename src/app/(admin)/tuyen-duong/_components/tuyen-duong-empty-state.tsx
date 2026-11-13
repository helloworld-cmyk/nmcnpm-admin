"use client";

import { Icon } from "@/components/icons/icon";
import { useTuyenDuongFiltersStore } from "@/global-states/tuyen-duong-filters-store";

const STATE_CLASS =
  "state-empty mb-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface)]";

type TuyenDuongEmptyStateProps = {
  variant: "no-routes" | "no-match";
  onAddRoute: () => void;
};

export function TuyenDuongEmptyState({
  variant,
  onAddRoute,
}: TuyenDuongEmptyStateProps) {
  const reset = useTuyenDuongFiltersStore((s) => s.reset);

  if (variant === "no-routes") {
    return (
      <section aria-label="Chưa có tuyến" className={STATE_CLASS}>
        <span className="state-empty-icon">
          <Icon name="i-route" />
        </span>
        <h3>Hãng chưa có tuyến nào</h3>
        <p>
          Thêm tuyến đầu tiên cho hãng để bắt đầu xếp lịch và tạo chuyến.
        </p>
        <button type="button" className="btn btn-primary" onClick={onAddRoute}>
          <Icon name="i-plus" />
          Thêm tuyến
        </button>
      </section>
    );
  }

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
