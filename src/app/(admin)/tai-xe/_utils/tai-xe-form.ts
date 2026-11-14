import type { TaiXe } from "./tai-xe";

/* Hạng giấy phép lái xe hợp lệ (khớp backend). */
export const GPLX_HANG_OPTIONS = ["B1", "B2", "C1", "C", "D1", "D2", "E"] as const;
export type GplxHang = (typeof GPLX_HANG_OPTIONS)[number];

export type TaiXeFormValues = {
  fullName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseClass: GplxHang;
  licenseExpiresOn: string;
};

/* Khi sửa (edit), chỉ gửi các field thay đổi. */
export type TaiXeFormPatchValues = Partial<TaiXeFormValues>;

export type TaiXeFormState = {
  fullName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiresOn: string;
};

export type TaiXeFormInvalid = {
  fullName: boolean;
  phone: boolean;
  email: boolean;
  licenseNumber: boolean;
  licenseClass: boolean;
  licenseExpiresOn: boolean;
};

export type TaiXeFormTarget = { mode: "add" } | { mode: "edit"; taiXe: TaiXe };

export type TaiXeConfirmMode = "lock" | "unlock" | "reset";

export type TaiXeFormValidation = {
  /* mode "add" → đủ field; mode "edit" → chỉ field thay đổi. */
  values: TaiXeFormValues | TaiXeFormPatchValues | null;
  errors: string[];
  invalid: TaiXeFormInvalid;
};

/**
 * - `mode: "add"` → validate tất cả field.
 * - `mode: "edit"` + `initial` → chỉ validate field đã thay đổi so với `initial`.
 *   Field không đổi không bị check lại (tài xế legacy/hết hạn GPLX vẫn sửa được).
 */
export type TaiXeFormValidationOptions = {
  mode: "add" | "edit";
  initial?: TaiXeFormState;
};

export const EMPTY_TAI_XE_FORM: TaiXeFormState = {
  fullName: "",
  phone: "",
  email: "",
  licenseNumber: "",
  licenseClass: "",
  licenseExpiresOn: "",
};

const EMPTY_INVALID: TaiXeFormInvalid = {
  fullName: false,
  phone: false,
  email: false,
  licenseNumber: false,
  licenseClass: false,
  licenseExpiresOn: false,
};

const PHONE_PATTERN = /^0\d{9,10}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function toTaiXeFormState(taiXe: TaiXe): TaiXeFormState {
  return {
    fullName: taiXe.ten,
    phone: taiXe.soDienThoai,
    email: taiXe.email,
    licenseNumber: taiXe.gplxRaw,
    licenseClass: taiXe.hangGplx,
    licenseExpiresOn: taiXe.hanGplx,
  };
}

function isHangGplx(value: string): value is GplxHang {
  return (GPLX_HANG_OPTIONS as readonly string[]).includes(value);
}

export function validateTaiXeForm(
  state: TaiXeFormState,
  options?: TaiXeFormValidationOptions
): TaiXeFormValidation {
  const fullName = state.fullName.trim();
  const phone = digitsOnly(state.phone);
  const email = state.email.trim();
  const licenseNumber = digitsOnly(state.licenseNumber);
  const licenseClass = state.licenseClass;
  const licenseExpiresOn = state.licenseExpiresOn;

  const errors: string[] = [];
  const invalid: TaiXeFormInvalid = { ...EMPTY_INVALID };

  /* Xác định field nào cần validate.
     - mode "add": luôn validate mọi field.
     - mode "edit": chỉ validate field thay đổi so với initial. */
  const isEdit = options?.mode === "edit" && options.initial != null;
  const initial = isEdit ? options.initial! : null;

  const fullNameChanged = !isEdit || fullName !== (initial!.fullName ?? "").trim();
  const phoneChanged = !isEdit || phone !== digitsOnly(initial!.phone ?? "");
  const emailChanged = !isEdit || email !== (initial!.email ?? "").trim();
  const licenseNumberChanged =
    !isEdit || licenseNumber !== digitsOnly(initial!.licenseNumber ?? "");
  const licenseClassChanged = !isEdit || licenseClass !== (initial!.licenseClass ?? "");
  const licenseExpiresOnChanged =
    !isEdit || licenseExpiresOn !== (initial!.licenseExpiresOn ?? "");

  if (fullNameChanged && fullName.length < 3) {
    invalid.fullName = true;
    errors.push("Họ tên tối thiểu 3 ký tự.");
  }

  if (phoneChanged && !PHONE_PATTERN.test(phone)) {
    invalid.phone = true;
    errors.push("SĐT chưa hợp lệ (bắt đầu bằng 0, gồm 10–11 chữ số).");
  }

  if (emailChanged && email && !EMAIL_PATTERN.test(email)) {
    invalid.email = true;
    errors.push("Email chưa đúng định dạng.");
  }

  if (licenseNumberChanged && licenseNumber.length !== 12) {
    invalid.licenseNumber = true;
    errors.push("Số GPLX phải gồm đúng 12 chữ số.");
  }

  if (licenseClassChanged && !isHangGplx(licenseClass)) {
    invalid.licenseClass = true;
    errors.push("Chọn hạng GPLX.");
  }

  /* Hạn GPLX: luôn validate nếu user đang nhập (thay đổi), vì backend @Future.
     Nếu không thay đổi thì bỏ qua (tài xế legacy/hết hạn vẫn sửa được). */
  if (licenseExpiresOnChanged) {
    const expiry = new Date(`${licenseExpiresOn}T00:00:00`);
    if (
      !licenseExpiresOn ||
      Number.isNaN(expiry.getTime()) ||
      expiry.getTime() <= Date.now()
    ) {
      invalid.licenseExpiresOn = true;
      errors.push("Hạn GPLX phải là ngày trong tương lai.");
    }
  }

  if (errors.length > 0) {
    return { values: null, errors, invalid };
  }

  /* mode "add" → trả về đủ field để POST.
     mode "edit" → chỉ trả về field đã thay đổi để PATCH partial. */
  if (!isEdit) {
    const values: TaiXeFormValues = {
      fullName,
      phone,
      email,
      licenseNumber,
      licenseClass: licenseClass as GplxHang,
      licenseExpiresOn,
    };
    return { values, errors: [], invalid };
  }

  const patch: TaiXeFormPatchValues = {};
  if (fullNameChanged) patch.fullName = fullName;
  if (phoneChanged) patch.phone = phone;
  if (emailChanged) patch.email = email;
  if (licenseNumberChanged) patch.licenseNumber = licenseNumber;
  if (licenseClassChanged) patch.licenseClass = licenseClass as GplxHang;
  if (licenseExpiresOnChanged) patch.licenseExpiresOn = licenseExpiresOn;

  return { values: patch, errors: [], invalid };
}
