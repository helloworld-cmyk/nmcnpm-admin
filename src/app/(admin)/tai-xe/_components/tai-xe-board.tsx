"use client";

import { Icon } from "@/components/icons/icon";
import { Reveal } from "@/components/reveal";
import { Toast } from "@/components/ui/toast";
import { useTaiXeBoard } from "../_hooks/use-tai-xe-board";
import { TaiXeConfirmModal } from "./tai-xe-confirm-modal";
import { TaiXeCredentialModal } from "./tai-xe-credential-modal";
import { TaiXeDetailModal } from "./tai-xe-detail-modal";
import { TaiXeEmptyState } from "./tai-xe-empty-state";
import { TaiXeErrorState } from "./tai-xe-error-state";
import { TaiXeFilters } from "./tai-xe-filters";
import { TaiXeFormModal } from "./tai-xe-form-modal";
import { TaiXeTable } from "./tai-xe-table";

const EMPTY_STATE_CLASS =
  "state-empty mb-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface)]";

export function TaiXeBoard() {
  const {
    companyId,
    companyHydrated,
    isLoading,
    isError,
    isFetching,
    errorText,
    refetch,
    drivers,
    totalElements,
    pageCount,
    safePage,
    start,
    detailTrips,
    formTarget,
    setFormTarget,
    detail,
    setDetail,
    confirmMode,
    setConfirmMode,
    credential,
    setCredential,
    credentialSubtitle,
    saving,
    toast,
    setToast,
    handleSave,
    handleConfirm,
    openStatusConfirm,
  } = useTaiXeBoard();

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
          <p>Chọn hãng đang quản lý để xem danh sách tài xế.</p>
        </section>
      );
    }
    if (isLoading) {
      return <div className="state-loading">Đang tải danh sách tài xế...</div>;
    }
    if (isError) {
      return (
        <TaiXeErrorState
          message={errorText}
          retrying={isFetching}
          onRetry={() => {
            void refetch();
          }}
        />
      );
    }
    if (drivers.length === 0) {
      return <TaiXeEmptyState />;
    }
    return (
      <Reveal>
        <TaiXeTable
          rows={drivers}
          totalCount={totalElements}
          rangeStart={totalElements > 0 ? start + 1 : 0}
          rangeEnd={start + drivers.length}
          page={safePage}
          pageCount={pageCount}
          onEdit={(taiXe) => setFormTarget({ mode: "edit", taiXe })}
          onToggleStatus={openStatusConfirm}
          onOpenDetail={(taiXe) => setDetail(taiXe)}
        />
      </Reveal>
    );
  };

  return (
    <>
      <Reveal>
        <section className="page-head">
          <div>
            <span className="page-head-eyebrow">Khu quản trị · Tài xế</span>
            <h1 className="page-head-title">Quản lý tài xế</h1>
          </div>
          <div className="page-head-action">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setFormTarget({ mode: "add" })}
              disabled={companyId.length === 0}
            >
              <Icon name="i-plus" />
              Tạo tài khoản tài xế
            </button>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <TaiXeFilters totalCount={totalElements} />
      </Reveal>

      {renderBody()}

      <TaiXeFormModal
        target={formTarget}
        drivers={drivers}
        saving={saving}
        onClose={() => setFormTarget(null)}
        onSave={handleSave}
      />

      <TaiXeDetailModal
        taiXe={detail}
        trips={detailTrips.data?.content ?? []}
        tripsLoading={detailTrips.isLoading}
        tripsError={detailTrips.isError}
        onClose={() => setDetail(null)}
        onEditRequest={() => {
          if (!detail) return;
          setFormTarget({ mode: "edit", taiXe: detail });
          setDetail(null);
        }}
        onResetRequest={() => setConfirmMode("reset")}
        onToggleStatus={() =>
          setConfirmMode(detail?.trangThai === "locked" ? "unlock" : "lock")
        }
      />

      <TaiXeConfirmModal
        mode={confirmMode}
        taiXe={detail}
        saving={saving}
        onClose={() => setConfirmMode(null)}
        onConfirm={handleConfirm}
      />

      <TaiXeCredentialModal
        credential={credential}
        subtitle={credentialSubtitle}
        onClose={() => setCredential(null)}
        onCopied={(ok) =>
          setToast({
            message: ok
              ? "Đã sao chép thông tin đăng nhập."
              : "Không sao chép tự động được — hãy copy thủ công.",
            type: ok ? "success" : "error",
          })
        }
      />

      <Toast toast={toast} onDone={() => setToast(null)} />
    </>
  );
}
