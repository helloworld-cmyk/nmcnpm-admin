"use client";

import { Icon } from "@/components/icons/icon";

/*
 * Đối soát theo chuyến: backend chưa có endpoint đối soát nên hiển thị trạng
 * thái rỗng cho tới khi có dữ liệu.
 */
export function ReconTable() {
  return (
    <article className="table-card">
      <div className="table-card-head">
        <div>
          <h2 className="table-title">Đối soát theo chuyến</h2>
          <p className="table-sub">
            Chênh lệch = tiền mặt thực thu − (số vé đã thu × giá vé)
          </p>
        </div>
      </div>
      <div className="state-empty">
        <span className="state-empty-icon">
          <Icon name="i-list" className="icon" />
        </span>
        <h3>Chưa có dữ liệu đối soát</h3>
        <p>
          Backend chưa có endpoint đối soát theo chuyến. Bảng sẽ hiển thị khi
          tính năng được bổ sung.
        </p>
      </div>
    </article>
  );
}
