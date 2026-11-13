"use client";

import { Icon } from "@/components/icons/icon";
import { Reveal } from "@/components/reveal";
import { Toast } from "@/components/ui/toast";
import { useKhachHangBoard } from "../_hooks/use-khach-hang-board";
import { KhachHangDetailModal } from "./khach-hang-detail-modal";
import { KhachHangEmptyState } from "./khach-hang-empty-state";
import { KhachHangErrorState } from "./khach-hang-error-state";
import { KhachHangFilters } from "./khach-hang-filters";
import { KhachHangLockModal } from "./khach-hang-lock-modal";
import { KhachHangPassModal } from "./khach-hang-pass-modal";
import { KhachHangTable } from "./khach-hang-table";
import { KhachHangUnlockModal } from "./khach-hang-unlock-modal";

const EMPTY_STATE_CLASS =
  "state-empty mb-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface)]";

export function KhachHangBoard() {
  const {
    companyId,
    companyHydrated,
    isLoading,
    isError,
    isFetching,
    errorText,
    refetch,
    sorted,
    rows,
    start,
    pageCount,
    safePage,
    detail,
    detailTicketsLoading,
    setDetailId,
    activeModal,
    setActiveModal,
    toast,
    setToast,
    handleLock,
    handleUnlock,
    handlePassGenerated,
  } = useKhachHangBoard();

  const renderBody = () => {
    if (!companyHydrated) {
      return (
        <div className="state-loading">Đang khởi tạo hãng quản lý...</div>
      );
    }
    if (companyId.length === 0) {
      return (
        <section aria-label="Chưa chọn hãng" className={EMPTY_STATE_CLASS}>
          <span className="state-empty-icon">
            <Icon name="i-alert" />
          </span>
          <h3>Chưa chọn hãng quản lý</h3>
          <p>Chọn hãng đang quản lý để xem danh sách khách hàng.</p>
        </section>
      );
    }
    if (isLoading) {
      return (
        <div className="state-loading">Đang tải danh sách khách hàng...</div>
      );
    }
    if (isError) {
      return (
        <KhachHangErrorState
          message={errorText}
          retrying={isFetching}
          onRetry={() => {
            void refetch();
          }}
        />
      );
    }
    if (sorted.length === 0) {
      return <KhachHangEmptyState />;
    }
    return (
      <Reveal>
        <KhachHangTable
          rows={rows}
          totalCount={sorted.length}
          rangeStart={start + 1}
          rangeEnd={start + rows.length}
          page={safePage}
          pageCount={pageCount}
          onOpenDetail={(kh) => setDetailId(kh.id)}
        />
      </Reveal>
    );
  };

  return (
    <>
      <Reveal>
        <section className="page-head">
          <div>
            <span className="page-head-eyebrow">Khu quản trị · Khách hàng</span>
            <h1 className="page-head-title">Quản lý khách hàng</h1>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <KhachHangFilters
          filteredCount={sorted.length}
          page={safePage}
          pageCount={pageCount}
        />
      </Reveal>

      {renderBody()}

      {detail && (
        <KhachHangDetailModal
          khachHang={detail}
          ticketsLoading={detailTicketsLoading}
          onClose={() => {
            setDetailId(null);
            setActiveModal(null);
          }}
          onLockRequest={() => setActiveModal("lock")}
          onUnlockRequest={() => setActiveModal("unlock")}
          onPassRequest={() => setActiveModal("pass")}
        />
      )}

      {detail && activeModal === "lock" && (
        <KhachHangLockModal
          khachHang={detail}
          onClose={() => setActiveModal(null)}
          onConfirm={handleLock}
        />
      )}

      {detail && activeModal === "unlock" && (
        <KhachHangUnlockModal
          khachHang={detail}
          onClose={() => setActiveModal(null)}
          onConfirm={handleUnlock}
        />
      )}

      {detail && activeModal === "pass" && (
        <KhachHangPassModal
          khachHang={detail}
          onClose={() => setActiveModal(null)}
          onGenerated={handlePassGenerated}
        />
      )}

      <Toast toast={toast} onDone={() => setToast(null)} />
    </>
  );
}
