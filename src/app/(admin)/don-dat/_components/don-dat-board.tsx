"use client";

import { Icon } from "@/components/icons/icon";
import { Reveal } from "@/components/reveal";

/*
 * Đơn đặt: backend hiện chỉ có endpoint đặt vé theo từng chuyến
 * (GET /bus-companies/{id}/trips/{tripId}/bookings), chưa có endpoint liệt kê
 * đơn theo hãng — nên màn hiển thị trạng thái rỗng thay cho dữ liệu mẫu.
 */
export function DonDatBoard() {
  return (
    <>
      <Reveal>
        <section className="page-head">
          <div>
            <span className="page-head-eyebrow">Khu quản trị · Đơn đặt</span>
            <h1 className="page-head-title">Quản lý đơn đặt</h1>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section
          aria-label="Chưa có dữ liệu"
          className="state-empty mb-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface)]"
        >
          <span className="state-empty-icon">
            <Icon name="i-ticket" />
          </span>
          <h3>Chưa có dữ liệu đơn đặt</h3>
          <p>
            Backend chưa có API liệt kê đơn đặt theo hãng. Danh sách sẽ hiển thị
            khi endpoint được bổ sung.
          </p>
        </section>
      </Reveal>
    </>
  );
}
