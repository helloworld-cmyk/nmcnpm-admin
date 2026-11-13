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

export function TuyenDuongBoard() {
  const {
    isLoading,
    isError,
    isFetching,
    errorText,
    refetch,
    rawRoutes,
    areas,
    areasLoading,
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

      {isLoading ? (
        <Reveal>
          <div className="state-loading">Đang tải danh sách tuyến...</div>
        </Reveal>
      ) : isError ? (
        <Reveal>
          <TuyenDuongErrorState
            message={errorText}
            retrying={isFetching}
            onRetry={() => {
              void refetch();
            }}
          />
        </Reveal>
      ) : filtered.length === 0 ? (
        <Reveal>
          <TuyenDuongEmptyState />
        </Reveal>
      ) : (
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
      )}

      <TuyenDuongFormModal
        target={formTarget}
        routes={rawRoutes}
        areas={areas}
        areasLoading={areasLoading}
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
