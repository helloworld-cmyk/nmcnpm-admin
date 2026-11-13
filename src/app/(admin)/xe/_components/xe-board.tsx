"use client";

import { Icon } from "@/components/icons/icon";
import { Reveal } from "@/components/reveal";
import { Toast } from "@/components/ui/toast";
import { useXeFiltersStore } from "@/global-states/xe-filters-store";
import { useXeBoard } from "../_hooks/use-xe-board";
import { XeDeleteModal } from "./xe-delete-modal";
import { XeFilters } from "./xe-filters";
import { XeFormModal } from "./xe-form-modal";
import { XeStats } from "./xe-stats";
import { XeTable } from "./xe-table";

const EMPTY_STATE_CLASS = [
  "state-empty mb-2 rounded-[var(--radius-md)]",
  "border border-dashed border-[var(--border)]",
  "bg-[var(--surface)]",
].join(" ");

function XeEmptyState() {
  const reset = useXeFiltersStore((s) => s.reset);

  return (
    <section aria-label="Không có kết quả" className={EMPTY_STATE_CLASS}>
      <span className="state-empty-icon">
        <Icon name="i-car" />
      </span>
      <h3>Không có xe nào khớp bộ lọc</h3>
      <p>Thử đổi từ khóa tìm kiếm hoặc xóa bộ lọc để xem toàn bộ đội xe.</p>
      <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
        Xóa lọc
      </button>
    </section>
  );
}

function XeErrorState({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <section aria-label="Lỗi tải dữ liệu" className={EMPTY_STATE_CLASS}>
      <span className="state-empty-icon text-[var(--red-600)]">
        <Icon name="i-alert" />
      </span>
      <h3>Không tải được danh sách xe</h3>
      <p>{message}</p>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={onRetry}
        disabled={retrying}
      >
        <Icon name="i-refresh" />
        {retrying ? "Đang tải..." : "Thử lại"}
      </button>
    </section>
  );
}

export function XeBoard() {
  const {
    companyId,
    companyHydrated,
    isLoading,
    isError,
    isFetching,
    errorText,
    refetch,
    vehicles,
    driverOptions,
    sorted,
    rows,
    stats,
    start,
    pageCount,
    safePage,
    formTarget,
    setFormTarget,
    deleteTarget,
    setDeleteTarget,
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
      return <XeEmptyState />;
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
          totalCount={vehicles.length}
        />
      </Reveal>

      {renderBody()}

      <XeFormModal
        target={formTarget}
        vehicles={vehicles}
        driverOptions={driverOptions}
        onClose={() => setFormTarget(null)}
        onSave={handleSave}
      />
      <XeDeleteModal
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      <Toast toast={toast} onDone={() => setToast(null)} />
    </>
  );
}
