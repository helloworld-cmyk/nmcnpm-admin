"use client";

import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import { Modal } from "@/components/ui/modal";
import {
  TRANG_THAI_TAI_KHOAN_LABEL,
  VE_TRANG_THAI_BADGE,
  formatVnd,
  vietTatHoTen,
  type KhachHang,
} from "../_data/customers";

const INFO_ITEM_CLASS =
  "rounded-xl border border-[var(--border-soft)] bg-[var(--bg)] px-3.5 py-2.5";
const INFO_LABEL_CLASS =
  "block text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--slate-500)]";
const INFO_VALUE_CLASS =
  "mt-0.5 block text-[14px] font-semibold text-[var(--ink)] [word-break:break-word]";
const TICKET_ITEM_CLASS =
  "flex items-center gap-3 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] px-3.5 py-3";
const SEAT_CHIP_CLASS =
  "inline-flex items-center rounded-full bg-[var(--navy-50)] px-2.5 py-0.5 text-[11.5px] font-bold text-[var(--slate-700)]";
const NO_TICKET_CLASS =
  "rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg)] px-3.5 py-4 text-center text-[13px] font-medium text-[var(--slate-500)]";
const DRAWER_LINK_CLASS =
  "inline-flex min-h-[44px] items-center gap-1.5 text-[12.5px] font-bold text-[var(--sky-700)] transition-colors hover:text-[var(--sky-800)]";

const LY_DO_KHOA_MAC_DINH =
  "Khách không thể đăng nhập và đặt vé mới cho tới khi được mở khóa.";

type KhachHangDetailModalProps = {
  khachHang: KhachHang;
  ticketsLoading?: boolean;
  onClose: () => void;
  onLockRequest: () => void;
  onUnlockRequest: () => void;
  onPassRequest: () => void;
};

export function KhachHangDetailModal({
  khachHang,
  ticketsLoading = false,
  onClose,
  onLockRequest,
  onUnlockRequest,
  onPassRequest,
}: KhachHangDetailModalProps) {
  const locked = khachHang.trangThai === "locked";

  const infoItems = [
    { label: "Số điện thoại", value: khachHang.soDienThoai },
    { label: "Email", value: khachHang.email },
    { label: "Ngày tạo tài khoản", value: khachHang.ngayTao },
    { label: "Số vé đã đặt", value: String(khachHang.veDaDat) },
    { label: "Tổng chi tiêu", value: formatVnd(khachHang.tongChiTieu) },
    { label: "Hạng thành viên", value: khachHang.hangThanhVien },
  ];

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="kh-avatar kh-avatar--lg">
            {vietTatHoTen(khachHang.ten)}
          </span>
          <span className="block min-w-0">
            <span className="block text-[11.5px] font-bold uppercase tracking-[0.08em] text-[var(--sky-700)] [font-family:var(--font-body)]">
              {khachHang.maKhach}
            </span>
            <span className="mt-0.5 flex flex-wrap items-center gap-2">
              <span className="text-[19px] font-extrabold leading-[1.2] tracking-[-0.02em] text-[var(--ink)]">
                {khachHang.ten}
              </span>
              <span className={`badge ${locked ? "badge--orange" : "badge--green"}`}>
                {locked && <Icon name="i-lock" />}
                {TRANG_THAI_TAI_KHOAN_LABEL[khachHang.trangThai]}
              </span>
            </span>
            <span className="mt-0.5 block text-[12.5px] font-medium text-[var(--slate-500)] [font-family:var(--font-body)]">
              Tham gia {khachHang.ngayTao} · {khachHang.veDaDat} vé đã đặt
            </span>
          </span>
        </div>
      }
      footer={
        <div className="flex w-full flex-wrap justify-between gap-2.5 max-[520px]:justify-end">
          <button type="button" className="btn btn-ghost" onClick={onPassRequest}>
            <Icon name="i-refresh" />
            Đặt lại mật khẩu
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={locked ? onUnlockRequest : onLockRequest}
          >
            <Icon name="i-lock" />
            {locked ? "Mở khóa" : "Khóa tài khoản"}
          </button>
        </div>
      }
    >
      <ul className="grid gap-2.5 [grid-template-columns:1fr_1fr] max-[560px]:[grid-template-columns:1fr]">
        {infoItems.map((item) => (
          <li key={item.label} className={INFO_ITEM_CLASS}>
            <span className={INFO_LABEL_CLASS}>{item.label}</span>
            <strong className={INFO_VALUE_CLASS}>{item.value}</strong>
          </li>
        ))}
      </ul>

      {locked && (
        <div className="kh-warn" role="note">
          <Icon name="i-lock" />
          <p>
            <strong>Tài khoản đang bị khóa.</strong>{" "}
            <span>{khachHang.lyDoKhoa ?? LY_DO_KHOA_MAC_DINH}</span>
          </p>
        </div>
      )}

      <section className="grid gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="[font-family:var(--font-heading)] text-[15.5px] font-bold tracking-[-0.01em] text-[var(--ink)]">
            Lịch sử vé gần đây
          </h3>
          <Link href="/don-dat" className={DRAWER_LINK_CLASS}>
            Xem tất cả đơn đặt
            <Icon name="i-arrow-right" className="icon h-3.5 w-3.5" />
          </Link>
        </div>

        {ticketsLoading ? (
          <p className={NO_TICKET_CLASS}>Đang tải lịch sử vé...</p>
        ) : khachHang.lichSuVe.length === 0 ? (
          <p className={NO_TICKET_CLASS}>
            Chưa có vé nào được ghi nhận cho tài khoản này.
          </p>
        ) : (
          <ul className="grid gap-2">
            {khachHang.lichSuVe.map((ve) => (
              <li key={ve.maVe} className={TICKET_ITEM_CLASS}>
                <span className="flex-none text-[11.5px] font-bold tracking-[0.04em] text-[var(--sky-700)]">
                  {ve.maVe}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <strong className="text-[13.5px] font-semibold text-[var(--ink)]">
                    {ve.tuyen}
                  </strong>
                  <span className="text-[12px] text-[var(--slate-500)]">
                    {ve.thoiGian}
                    {ve.daThuTien ? " · đã thu tiền" : ""}
                  </span>
                </span>
                <span className="flex flex-none flex-wrap items-center justify-end gap-1">
                  <span className={SEAT_CHIP_CLASS}>Ghế {ve.ghe}</span>
                  <span className={`badge ${VE_TRANG_THAI_BADGE[ve.trangThai]}`}>
                    {ve.trangThai}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Modal>
  );
}
