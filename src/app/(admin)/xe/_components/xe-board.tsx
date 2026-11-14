"use client";

import { Icon } from "@/components/icons/icon";
import { Reveal } from "@/components/reveal";
import { Toast } from "@/components/ui/toast";
import { useXeBoard } from "../_hooks/use-xe-board";
import { XeDeleteModal } from "./xe-delete-modal";
import { XeDocumentModal } from "./xe-document-modal";
import { XeEmptyState } from "./xe-empty-state";
import { XeErrorState } from "./xe-error-state";
import { XeFilters } from "./xe-filters";
import { XeFormModal } from "./xe-form-modal";
import { XeSeatModal } from "./xe-seat-modal";
import { XeStats } from "./xe-stats";
import { XeTable } from "./xe-table";

const EMPTY_STATE_CLASS = [
  "state-empty mb-2 rounded-[var(--radius-md)]",
  "border border-dashed border-[var(--border)]",
  "bg-[var(--surface)]",
].join(" ");

export function XeBoard() {
  const {
    companyId,
    companyHydrated,
    isLoading,
    isError,
    isFetching,
    errorText,
    refetch,
    fleet,
    sorted,
    rows,
    stats,
    soChoOptions,
    hasNoVehicles,
    start,
    pageCount,
    safePage,
    formTarget,
    setFormTarget,
    deleteTarget,
    setDeleteTarget,
    seatTarget,
    setSeatTarget,
    docTarget,
    setDocTarget,
    toast,
    setToast,
    handleSave,
    handleDelete,
  } = useXeBoard();

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
          <p>Chọn hãng đang quản lý để xem danh sách xe.</p>
        </section>
      );
    }
    if (isLoading) {
      return <div className="state-loading">Đang tải danh sách xe...</div>;
    }
    if (isError) {
      return (
        <XeErrorState
          message={errorText}
          retrying={isFetching}
          onRetry={() => {
            void refetch();
          }}
        />
      );
    }
    if (sorted.length === 0) {
      return (
        <XeEmptyState
          variant={hasNoVehicles ? "no-vehicles" : "no-match"}
          onAddVehicle={() => setFormTarget({ mode: "add" })}
        />
      );
    }
    return (
      <Reveal>
        <XeTable
          rows={rows}
          totalCount={sorted.length}
          rangeStart={rows.length > 0 ? start + 1 : 0}
          rangeEnd={start + rows.length}
          pageCount={pageCount}
          page={safePage}
          onEdit={(xe) => setFormTarget({ mode: "edit", xe })}
          onDelete={(xe) => setDeleteTarget(xe)}
          onSeat={(xe) =>
            setSeatTarget({
              vehicleId: xe.id,
              bienSo: xe.bienSo,
              loaiXe: xe.loaiXe,
            })
          }
          onDocs={(xe) =>
            setDocTarget({
              vehicleId: xe.id,
              bienSo: xe.bienSo,
              loaiXe: xe.loaiXe,
            })
          }
        />
      </Reveal>
    );
  };

  return (
    <>
      <Reveal>
        <section className="page-head">
          <div>
            <span className="page-head-eyebrow">Khu quản trị · Đội xe</span>
            <h1 className="page-head-title">Quản lý xe</h1>
          </div>
          <div className="page-head-action">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setFormTarget({ mode: "add" })}
              disabled={companyId.length === 0}
            >
              <Icon name="i-plus" />
              Thêm xe
            </button>
          </div>
        </section>
      </Reveal>

      <XeStats stats={stats} />

      <Reveal>
        <XeFilters
          filteredCount={sorted.length}
          totalCount={fleet.length}
          soChoOptions={soChoOptions}
        />
      </Reveal>

      {renderBody()}

      <XeFormModal
        target={formTarget}
        vehicles={fleet}
        onClose={() => setFormTarget(null)}
        onSave={handleSave}
      />
      <XeDeleteModal
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      <XeSeatModal
        target={seatTarget}
        companyId={companyId}
        onClose={() => setSeatTarget(null)}
        onSaved={(message) => {
          setSeatTarget(null);
          setToast({ message, type: "success" });
        }}
      />
      <XeDocumentModal
        target={docTarget}
        companyId={companyId}
        onClose={() => setDocTarget(null)}
        onSaved={(message) => {
          setDocTarget(null);
          setToast({ message, type: "success" });
        }}
      />
      <Toast toast={toast} onDone={() => setToast(null)} />
    </>
  );
}
