"use client";

import { Icon } from "@/components/icons/icon";
import { Reveal } from "@/components/reveal";
import { Toast } from "@/components/ui/toast";
import { useChuyenBoard } from "../_hooks/use-chuyen-board";
import { ChuyenCancelModal } from "./chuyen-cancel-modal";
import { ChuyenDeleteModal } from "./chuyen-delete-modal";
import { ChuyenDetailDrawer } from "./chuyen-detail-drawer";
import { ChuyenFormModal } from "./chuyen-form-modal";
import { ChuyenLich } from "./chuyen-lich";
import { ChuyenSucoKetQuaModal } from "./chuyen-suco-ket-qua-modal";
import { ChuyenSucoXuLyModal } from "./chuyen-suco-xu-ly-modal";
import { ChuyenTable } from "./chuyen-table";
import { ChuyenToolbar } from "./chuyen-toolbar";
import { ChuyenPageHead } from "./page-head";

export function ChuyenBoard() {
  const {
    companyId,
    companyHydrated,
    view,
    isLoading,
    isError,
    errorText,
    refetch,
    trips,
    counts,
    tuyenOptions,
    taixeOptions,
    xeOptions,
    routeDurations,
    sorted,
    pageRows,
    currentPage,
    pageCount,
    detailTrip,
    cancelTrip,
    deleteTrip,
    cancelPending,
    deletePending,
    formPending,
    sucoTrip,
    sucoState,
    formState,
    toast,
    setToast,
    handleReset,
    openCreate,
    openEdit,
    openDetail,
    openCancelFromTable,
    openCancelFromDrawer,
    openDeleteFromTable,
    openDeleteFromDrawer,
    openSuco,
    closeDetail,
    closeForm,
    closeCancel,
    closeDelete,
    closeSuco,
    handleSaveForm,
    handleConfirmCancel,
    handleConfirmDelete,
    handleSucoNhan,
    handleSucoKetQua,
    handlePublish,
  } = useChuyenBoard();

  const renderBody = () => {
    if (!companyHydrated) {
      return <div className="state-loading">Đang khởi tạo hãng quản lý...</div>;
    }
    if (companyId.length === 0) {
      return (
        <div className="state-empty">
          <span className="state-empty-icon" aria-hidden="true">
            <Icon name="i-alert" className="icon" />
          </span>
          <h3>Chưa chọn hãng quản lý</h3>
          <p>Chọn hãng đang quản lý để xem danh sách chuyến.</p>
        </div>
      );
    }
    if (isLoading) {
      return <div className="state-loading">Đang tải danh sách chuyến...</div>;
    }
    if (isError) {
      return (
        <div className="state-empty">
          <span className="state-empty-icon" aria-hidden="true">
            <Icon name="i-alert" className="icon" />
          </span>
          <h3>Không tải được danh sách chuyến</h3>
          <p>{errorText}</p>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => void refetch()}
          >
            <Icon name="i-refresh" />
            Thử lại
          </button>
        </div>
      );
    }
    if (view === "lich") {
      return (
        <ChuyenLich
          trips={trips}
          xeOptions={xeOptions}
          taixeOptions={taixeOptions}
          onDetail={openDetail}
          onCreate={openCreate}
        />
      );
    }
    return (
      <ChuyenTable
        rows={pageRows}
        total={sorted.length}
        page={currentPage}
        pageCount={pageCount}
        onDetail={openDetail}
        onEdit={openEdit}
        onCancel={openCancelFromTable}
        onDelete={openDeleteFromTable}
        onReset={handleReset}
        onPublish={handlePublish}
      />
    );
  };

  return (
    <div>
      <Reveal>
        <ChuyenPageHead onCreate={() => openCreate()} />
      </Reveal>

      <Reveal delay={60}>
        <ChuyenToolbar
          counts={counts}
          onReset={handleReset}
          tuyenOptions={tuyenOptions}
          taixeOptions={taixeOptions}
        />
      </Reveal>

      <Reveal delay={120}>{renderBody()}</Reveal>

      <ChuyenDetailDrawer
        trip={detailTrip}
        onClose={closeDetail}
        onEdit={openEdit}
        onCancel={openCancelFromDrawer}
        onDelete={openDeleteFromDrawer}
        onSuco={openSuco}
      />

      {formState && (
        <ChuyenFormModal
          key={formState.key}
          target={formState.target}
          trips={trips}
          tuyenOptions={tuyenOptions}
          routeDurations={routeDurations}
          xeOptions={xeOptions}
          taixeOptions={taixeOptions}
          saving={formPending}
          onClose={closeForm}
          onSave={handleSaveForm}
        />
      )}

      {cancelTrip && (
        <ChuyenCancelModal
          key={cancelTrip.id}
          trip={cancelTrip}
          onClose={closeCancel}
          onConfirm={handleConfirmCancel}
          submitting={cancelPending}
        />
      )}

      {deleteTrip && (
        <ChuyenDeleteModal
          key={deleteTrip.id}
          trip={deleteTrip}
          onClose={closeDelete}
          onConfirm={handleConfirmDelete}
          submitting={deletePending}
        />
      )}

      {sucoState?.step === "nhan" && sucoTrip && (
        <ChuyenSucoXuLyModal
          key={sucoState.key}
          trip={sucoTrip}
          onClose={closeSuco}
          onConfirm={handleSucoNhan}
        />
      )}

      {sucoState?.step === "ket-qua" && sucoTrip && (
        <ChuyenSucoKetQuaModal
          key={sucoState.key}
          trip={sucoTrip}
          onClose={closeSuco}
          onConfirm={handleSucoKetQua}
        />
      )}

      <Toast toast={toast} onDone={() => setToast(null)} />
    </div>
  );
}
