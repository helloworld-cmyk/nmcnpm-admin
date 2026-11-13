"use client";

import { Icon } from "@/components/icons/icon";
import { Modal } from "@/components/ui/modal";
import type { ChuyenRecord } from "../_data/chuyen";

type ChuyenDeleteModalProps = {
  trip: ChuyenRecord | null;
  onClose: () => void;
  onConfirm: (tripId: string) => void;
  submitting?: boolean;
};

/*
 * Xác nhận xóa chuyến nháp. Backend chỉ cho xóa chuyến DRAFT đang đóng bán và
 * chưa có đặt vé/vé/sự cố; chuyến đã mở bán phải dùng "Hủy chuyến" để giữ lịch sử.
 */
export function ChuyenDeleteModal({
  trip,
  onClose,
  onConfirm,
  submitting = false,
}: ChuyenDeleteModalProps) {
  return (
    <Modal
      open={trip !== null}
      onClose={onClose}
      size="sm"
      title={
        trip ? (
          <span className="block">
            <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--red-600)]">
              Xử lý chuyến
            </span>
            <span className="block text-[18px] leading-[1.25]">
              Xóa chuyến nháp {trip.ma}
            </span>
          </span>
        ) : (
          ""
        )
      }
      footer={
        <>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Giữ chuyến
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => trip && onConfirm(trip.id)}
            disabled={submitting}
          >
            {submitting ? "Đang xóa..." : "Xóa chuyến nháp"}
          </button>
        </>
      }
    >
      {trip && (
        <>
          <p className="text-[13.5px] leading-[1.65] text-[var(--slate-600)]">
            Xóa vĩnh viễn chuyến{" "}
            <strong className="text-[var(--ink)]">{trip.ma}</strong> khỏi danh
            sách. Thao tác này không thể hoàn tác.
          </p>

          <div
            role="note"
            className="flex gap-2.5 rounded-[var(--radius-sm)] border border-[var(--orange-100)] bg-[var(--orange-50)] p-3 text-[12.5px] leading-[1.55] text-[var(--slate-700)]"
          >
            <Icon
              name="i-alert"
              className="h-[18px] w-[18px] flex-none text-[var(--orange-600)]"
            />
            <p>
              Chỉ xóa được chuyến nháp chưa công bố, chưa có đặt vé. Chuyến đã
              mở bán hãy dùng <strong>Hủy chuyến</strong> để giữ lịch sử.
            </p>
          </div>
        </>
      )}
    </Modal>
  );
}
