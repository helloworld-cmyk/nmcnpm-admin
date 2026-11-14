"use client";

import { Modal } from "@/components/ui/modal";
import {
  EMPTY_TAI_XE_FORM,
  toTaiXeFormState,
  type TaiXeFormPatchValues,
  type TaiXeFormTarget,
  type TaiXeFormValues,
} from "../_utils/tai-xe-form";
import { TaiXeFormBody } from "./tai-xe-form-body";

type TaiXeFormModalProps = {
  target: TaiXeFormTarget | null;
  saving: boolean;
  onClose: () => void;
  onSave: (values: TaiXeFormValues | TaiXeFormPatchValues) => void;
};

const TITLE_HINT_CLASS = [
  "mt-1 block text-[12.5px] font-medium leading-snug",
  "tracking-normal text-[var(--slate-500)]",
].join(" ");

export function TaiXeFormModal({
  target,
  saving,
  onClose,
  onSave,
}: TaiXeFormModalProps) {
  const isEdit = target?.mode === "edit";
  const initial =
    target && target.mode === "edit"
      ? toTaiXeFormState(target.taiXe)
      : EMPTY_TAI_XE_FORM;

  return (
    <Modal
      open={target !== null}
      onClose={onClose}
      size="md"
      title={
        <>
          <span className="block">
            {isEdit && target && target.mode === "edit"
              ? `Sửa thông tin ${target.taiXe.ten}`
              : "Tạo tài khoản tài xế"}
          </span>
          <span className={TITLE_HINT_CLASS}>
            {isEdit
              ? "Cập nhật thông tin cá nhân và giấy phép lái xe của tài xế."
              : "Thông tin đăng nhập sẽ hiển thị một lần sau khi tạo để bàn giao."}
          </span>
        </>
      }
    >
      <TaiXeFormBody
        key={
          target
            ? `${target.mode}:${target.mode === "edit" ? target.taiXe.id : ""}`
            : "closed"
        }
        initial={initial}
        isEdit={Boolean(isEdit)}
        saving={saving}
        onClose={onClose}
        onSave={onSave}
      />
    </Modal>
  );
}
