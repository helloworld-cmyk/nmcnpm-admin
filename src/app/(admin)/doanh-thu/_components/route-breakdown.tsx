"use client";

import { Icon } from "@/components/icons/icon";

/*
 * Doanh thu theo tuyến: backend chưa có endpoint tổng hợp theo tuyến nên hiển
 * thị trạng thái rỗng cho tới khi có dữ liệu.
 */
export function RouteBreakdown() {
  return (
    <article className="admin-card">
      <div className="admin-card-head">
        <div>
          <h2>Doanh thu theo tuyến</h2>
          <p>Tổng tiền thực thu trong kỳ</p>
        </div>
      </div>
      <div className="admin-card-body">
        <div className="state-empty">
          <span className="state-empty-icon">
            <Icon name="i-route" className="icon" />
          </span>
          <h3>Chưa có dữ liệu theo tuyến</h3>
          <p>
            Báo cáo doanh thu hiện chỉ tổng hợp theo kỳ. Dữ liệu theo tuyến sẽ
            hiển thị khi backend bổ sung.
          </p>
        </div>
      </div>
    </article>
  );
}
