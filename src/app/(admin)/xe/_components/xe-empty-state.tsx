"use client";

import { Icon } from "@/components/icons/icon";
import { useXeFiltersStore } from "@/global-states/xe-filters-store";

const STATE_CLASS = [
  "state-empty mb-2 rounded-[var(--radius-md)]",
  "border border-dashed border-[var(--border)]",
  "bg-[var(--surface)]",
].join(" ");

type XeEmptyStateProps = {
  variant: "no-vehicles" | "no-match";
  onAddVehicle: () => void;
};

export function XeEmptyState({ variant, onAddVehicle }: XeEmptyStateProps) {
  const reset = useXeFiltersStore((s) => s.reset);

  if (variant === "no-vehicles") {
    return (
      <section aria-label="Chưa có xe" className={STATE_CLASS}>
        <span className="state-empty-icon">
          <Icon name="i-car" />
        </span>
        <h3>Hãng chưa có xe nào</h3>
        <p>Thêm xe đầu tiên vào đội xe để bắt đầu xếp chuyến và phân công.</p>
        <button type="button" className="btn btn-primary" onClick={onAddVehicle}>
          <Icon name="i-plus" />
          Thêm xe
        </button>
      </section>
    );
  }

  return (
    <section aria-label="Không có kết quả" className={STATE_CLASS}>
      <span className="state-empty-icon">
        <Icon name="i-search" />
      </span>
      <h3>Không có xe nào khớp bộ lọc</h3>
      <p>Thử đổi từ khóa tìm kiếm hoặc xóa bộ lọc để xem toàn bộ đội xe.</p>
      <button type="button" className="btn btn-ghost" onClick={reset}>
        Xóa lọc
      </button>
    </section>
  );
}
