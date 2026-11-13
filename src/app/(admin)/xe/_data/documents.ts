import type {
  VehicleDocumentResponse,
  VehicleDocumentStatus,
  VehicleDocumentType,
} from "@/api/xe/api/types";

/* Hằng số + state cho trình quản lý giấy tờ xe (upsert theo từng loại). */

/* Bốn loại giấy tờ backend hỗ trợ, kèm nhãn hiển thị tiếng Việt. */
export const XE_DOC_TYPES: { value: VehicleDocumentType; label: string }[] = [
  { value: "REGISTRATION", label: "Giấy đăng ký xe" },
  { value: "INSPECTION", label: "Giấy đăng kiểm" },
  { value: "LIABILITY_INSURANCE", label: "Bảo hiểm TNDS bắt buộc" },
  { value: "PHYSICAL_DAMAGE_INSURANCE", label: "Bảo hiểm vật chất xe" },
];

export function docTypeLabel(type: VehicleDocumentType): string {
  return XE_DOC_TYPES.find((item) => item.value === type)?.label ?? type;
}

/* Nhãn + lớp badge cho trạng thái hiệu lực giấy tờ. */
export const XE_DOC_STATUS: Record<
  VehicleDocumentStatus,
  { label: string; badge: string }
> = {
  VALID: { label: "Còn hiệu lực", badge: "badge--green" },
  EXPIRED: { label: "Hết hiệu lực", badge: "badge--red" },
  NOT_YET_VALID: { label: "Chưa hiệu lực", badge: "badge--orange" },
  UNKNOWN: { label: "Chưa rõ", badge: "badge--slate" },
};

/* Xe đang được quản lý giấy tờ. */
export type XeDocumentTarget = {
  vehicleId: string;
  bienSo: string;
  loaiXe: string;
};

/* Bản nháp giấy tờ của một loại; mọi trường đều tùy chọn. */
export type XeDocumentDraft = {
  documentNumber: string;
  issuer: string;
  issuedOn: string;
  expiresOn: string;
  description: string;
};

export const EMPTY_XE_DOCUMENT_DRAFT: XeDocumentDraft = {
  documentNumber: "",
  issuer: "",
  issuedOn: "",
  expiresOn: "",
  description: "",
};

/* Khởi tạo bản nháp trống cho cả 4 loại giấy tờ. */
export function emptyXeDocumentDrafts(): Record<
  VehicleDocumentType,
  XeDocumentDraft
> {
  return XE_DOC_TYPES.reduce(
    (acc, item) => {
      acc[item.value] = { ...EMPTY_XE_DOCUMENT_DRAFT };
      return acc;
    },
    {} as Record<VehicleDocumentType, XeDocumentDraft>
  );
}

/* Nạp bản nháp từ danh sách giấy tờ đã có của xe. */
export function seedXeDocumentDrafts(
  documents: VehicleDocumentResponse[]
): Record<VehicleDocumentType, XeDocumentDraft> {
  const drafts = emptyXeDocumentDrafts();
  documents.forEach((doc) => {
    drafts[doc.type] = {
      documentNumber: doc.documentNumber ?? "",
      issuer: doc.issuer ?? "",
      issuedOn: doc.issuedOn ?? "",
      expiresOn: doc.expiresOn ?? "",
      description: doc.description ?? "",
    };
  });
  return drafts;
}
