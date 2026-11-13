"use client";

import { Icon } from "@/components/icons/icon";
import { Reveal } from "@/components/reveal";
import { Toast } from "@/components/ui/toast";
import { useTuyenDuongBoard } from "../_hooks/use-tuyen-duong-board";
import { TuyenDuongConfirmModal } from "./tuyen-duong-confirm-modal";
import { TuyenDuongEmptyState } from "./tuyen-duong-empty-state";
import { TuyenDuongErrorState } from "./tuyen-duong-error-state";
import { TuyenDuongFormModal } from "./tuyen-duong-form-modal";
import { TuyenDuongTable } from "./tuyen-duong-table";
import { TuyenDuongToolbar } from "./tuyen-duong-toolbar";

const EMPTY_STATE_CLASS =
  "state-empty mb-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface)]";

export function TuyenDuongBoard() {
  const {
    companyId,
    companyHydrated,
    isLoading,
    isError,
    isFetching,
    errorText,
    refetch,
    rawRoutes,
    areas,
    areasLoading,
    areasError,
    areasErrorText,
    areasRetrying,
    refetchAreas,
    hasNoRoutes,
    filtered,
    rows,
    pageCount,
    safePage,
    countText,
    formTarget,
    setFormTarget,
    pauseTarget,
    setPauseTarget,
    toast,
    setToast,
    updatePending,
    handleToggle,
    handleConfirmPause,
    handleFormSave,
  } = useTuyenDuongBoard();

  const renderBody = () => {
    if (!companyHydrated) {
      return (
        <Reveal>
          <div className="state-loading">Đang khởi tạo hãng quản lý...</div>
        </Reveal>
      );
    }
    if (companyId.length === 0) {
      return (
        <Reveal>
          <section aria-label="Chưa chọn hãng" className={EMPTY_STATE_CLASS}>
            <span className="state-empty-icon">
              <Icon name="i-alert" />
            </span>
            <h3>Chưa chọn hãng quản lý</h3>
            <p>Chọn hãng đang quản lý để xem danh sách tuyến.</p>
          </section>
        </Reveal>
      );
    }
    if (isLoading) {
      return (
        <Reveal>
          <div className="state-loading">Đang tải danh sách tuyến...</div>
        </Reveal>
      );
    }
    if (isError) {
      return (
        <Reveal>
          <TuyenDuongErrorState
            message={errorText}
            retrying={isFetching}
            onRetry={() => {
              void refetch();
            }}
          />
        </Reveal>
      );
    }
    if (filtered.length === 0) {
      return (
        <Reveal>
          <TuyenDuongEmptyState
            variant={hasNoRoutes ? "no-routes" : "no-match"}
            onAddRoute={() => setFormTarget({ mode: "add" })}
          />
        </Reveal>
      );
    }
    return (
      <Reveal>
        <TuyenDuongTable
          rows={rows}
          page={safePage}
          pageCount={pageCount}
          onToggle={handleToggle}
          onEdit={(route) => {
            const raw = rawRoutes.find((item) => item.id === route.id);
            if (raw) setFormTarget({ mode: "edit", route: raw });
          }}
        />
      </Reveal>
    );
  };

  return (
    <>
      <Reveal>
        <section className="page-head">
          <div>
            <span className="page-head-eyebrow">Vận hành · Tuyến đường</span>
            <h1 className="page-head-title">Quản lý tuyến</h1>
          </div>
          <div className="page-head-action">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setFormTarget({ mode: "add" })}
              disabled={companyId.length === 0}
            >
              <Icon name="i-plus" />
              Thêm tuyến
            </button>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <TuyenDuongToolbar countText={countText} />
      </Reveal>

      {renderBody()}

      <TuyenDuongFormModal
        target={formTarget}
        routes={rawRoutes}
        areas={areas}
        areasLoading={areasLoading}
        areasError={areasError}
        areasErrorText={areasErrorText}
        areasRetrying={areasRetrying}
        onRetryAreas={() => {
          void refetchAreas();
        }}
        onClose={() => setFormTarget(null)}
        onSave={handleFormSave}
      />
      <TuyenDuongConfirmModal
        target={pauseTarget}
        busy={updatePending}
        onClose={() => setPauseTarget(null)}
        onConfirm={handleConfirmPause}
      />
      <Toast toast={toast} onDone={() => setToast(null)} />
    </>
  );
}
