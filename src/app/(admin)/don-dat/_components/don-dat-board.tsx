"use client";

import { Icon } from "@/components/icons/icon";
import { Reveal } from "@/components/reveal";
import { Toast } from "@/components/ui/toast";
import { useDonDatBoard } from "../_hooks/use-don-dat-board";
import { DonDatCancelModal } from "./don-dat-cancel-modal";
import { DonDatDetailDrawer } from "./don-dat-detail-drawer";
import { DonDatStats } from "./don-dat-stats";
import { DonDatTable } from "./don-dat-table";
import { DonDatToolbar } from "./don-dat-toolbar";

const EMPTY_STATE_CLASS = [
  "state-empty mb-2 rounded-[var(--radius-md)]",
  "border border-dashed border-[var(--border)]",
  "bg-[var(--surface)]",
].join(" ");

export function DonDatBoard({
  initialCustomerId,
  initialViewStatus,
}: {
  initialCustomerId?: string;
  initialViewStatus?: string;
}) {
  const {
    companyId,
    companyHydrated,
    rows,
    counts,
    statistics,
    statsLoading,
    isLoading,
    isFetching,
    isError,
    errorText,
    refetch,
    page,
    pageCount,
    totalElements,
    rangeStart,
    rangeEnd,
    customerId,
    customerName,
    customerLoading,
    clearCustomer,
    detail,
    detailOpen,
    detailLoading,
    detailError,
    cancelTarget,
    openDetail,
    closeDetail,
    openCancelFromTable,
    openCancelFromDetail,
    closeCancel,
    toast,
    setToast,
    handleReset,
  } = useDonDatBoard(initialCustomerId ?? "", initialViewStatus ?? "");

  const renderBody = () => {
    if (!companyHydrated) {
      return <div className="state-loading">Đang khởi tạo hãng quản lý...</div>;
    }
    if (companyId.length === 0) {
      return (
        <section aria-label="Chưa chọn hãng" className={EMPTY_STATE_CLASS}>
          <span className="state-empty-icon">
            <Icon name="i-alert" />
          </span>
          <h3>Chưa chọn hãng quản lý</h3>
          <p>Chọn hãng đang quản lý để xem danh sách đơn đặt.</p>
        </section>
      );
    }
    if (isLoading) {
      return <div className="state-loading">Đang tải danh sách đơn đặt...</div>;
    }
    if (isError) {
      return (
        <div className="state-empty">
          <span className="state-empty-icon" aria-hidden="true">
            <Icon name="i-alert" className="icon" />
          </span>
          <h3>Không tải được danh sách đơn đặt</h3>
          <p>{errorText}</p>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={refetch}
          >
            <Icon name="i-refresh" />
            Thử lại
          </button>
        </div>
      );
    }
    if (rows.length === 0) {
      return (
        <section aria-label="Không có đơn" className={EMPTY_STATE_CLASS}>
          <span className="state-empty-icon">
            <Icon name="i-ticket" />
          </span>
          <h3>Không có đơn đặt nào khớp bộ lọc</h3>
          <p>Thử đổi trạng thái, khoảng ngày hoặc từ khóa tìm kiếm khác.</p>
        </section>
      );
    }
    return (
      <DonDatTable
        rows={rows}
        totalCount={totalElements}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        pageCount={pageCount}
        page={page}
        onDetail={openDetail}
        onCancel={openCancelFromTable}
      />
    );
  };

  const ready = companyHydrated && companyId.length > 0;

  return (
    <div>
      <Reveal>
        <section className="page-head">
          <div>
            <span className="page-head-eyebrow">Khu quản trị · Đơn đặt</span>
            <h1 className="page-head-title">Quản lý đơn đặt</h1>
          </div>
          {ready ? (
            <div className="page-head-action">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleReset}
              >
                <Icon name="i-refresh" />
                Đặt lại bộ lọc
              </button>
            </div>
          ) : null}
        </section>
      </Reveal>

      {ready ? (
        <>
          <Reveal>
            <DonDatStats
              companyId={companyId}
              statistics={statistics}
              loading={statsLoading}
            />
          </Reveal>

          <Reveal delay={60}>
            <div className="mt-6 max-[640px]:mt-[18px]">
              <DonDatToolbar
                counts={counts}
                customerId={customerId}
                customerName={customerName}
                customerLoading={customerLoading}
                onClearCustomer={clearCustomer}
                onReset={handleReset}
              />
            </div>
          </Reveal>
        </>
      ) : null}

      <Reveal delay={ready ? 120 : 60}>
        <div className={ready ? "mt-6 max-[640px]:mt-[18px]" : ""}>
          {renderBody()}
        </div>
      </Reveal>

      {isFetching && !isLoading ? (
        <p className="mt-2 text-center text-[12.5px] font-semibold text-[var(--slate-500)]">
          Đang cập nhật...
        </p>
      ) : null}

      <DonDatDetailDrawer
        detail={detail}
        open={detailOpen}
        loading={detailLoading}
        error={detailError}
        onClose={closeDetail}
        onCancel={openCancelFromDetail}
      />

      <DonDatCancelModal
        companyId={companyId}
        target={cancelTarget}
        onClose={closeCancel}
        onDone={(message) => {
          closeCancel();
          setToast({ message, type: "success" });
        }}
      />

      <Toast toast={toast} onDone={() => setToast(null)} />
    </div>
  );
}
