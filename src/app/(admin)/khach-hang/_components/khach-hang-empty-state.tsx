"use client";

import { Icon } from "@/components/icons/icon";
import { useKhachHangFiltersStore } from "@/global-states/khach-hang-filters-store";

const STATE_CLASS =
  "state-empty mb-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface)]";

export function KhachHangEmptyState() {
  const reset = useKhachHangFiltersStore((s) => s.reset);

  return (
    <section aria-label="Không có kết quả" className={STATE_CLASS}>
      <span className="state-empty-icon">
        <Icon name="i-search" />
      </span>
      <h3>Không tìm thấy khách hàng</h3>
      <p>
        Không có tài khoản nào khớp với từ khóa và trạng thái đang lọc. Thử từ
        khóa khác hoặc đặt lại bộ lọc để xem toàn bộ danh sách.
      </p>
      <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
        Đặt lại bộ lọc
      </button>
    </section>
  );
}
