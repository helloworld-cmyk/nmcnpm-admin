import {
  GPLX_HANG_OPTIONS,
  type GplxHang,
  type TaiXe,
  type TaiXeFormValues,
} from "../_data/tai-xe";

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
  values: TaiXeFormValues | null;
  errors: string[];
  invalid: TaiXeFormInvalid;
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
  state: TaiXeFormState
): TaiXeFormValidation {
  const fullName = state.fullName.trim();
  const phone = digitsOnly(state.phone);
  const email = state.email.trim();
  const licenseNumber = digitsOnly(state.licenseNumber);
  const licenseClass = state.licenseClass;
  const licenseExpiresOn = state.licenseExpiresOn;

  const errors: string[] = [];
  const invalid: TaiXeFormInvalid = { ...EMPTY_INVALID };

  if (fullName.length < 3) {
    invalid.fullName = true;
    errors.push("Họ tên tối thiểu 3 ký tự.");
  }

  if (!PHONE_PATTERN.test(phone)) {
    invalid.phone = true;
    errors.push("SĐT chưa hợp lệ (bắt đầu bằng 0, gồm 10–11 chữ số).");
  }

  if (email && !EMAIL_PATTERN.test(email)) {
    invalid.email = true;
    errors.push("Email chưa đúng định dạng.");
  }

  if (licenseNumber.length !== 12) {
    invalid.licenseNumber = true;
    errors.push("Số GPLX phải gồm đúng 12 chữ số.");
  }

  if (!isHangGplx(licenseClass)) {
    invalid.licenseClass = true;
    errors.push("Chọn hạng GPLX.");
  }

  const expiry = new Date(`${licenseExpiresOn}T00:00:00`);
  if (
    !licenseExpiresOn ||
    Number.isNaN(expiry.getTime()) ||
    expiry.getTime() <= Date.now()
  ) {
    invalid.licenseExpiresOn = true;
    errors.push("Hạn GPLX phải là ngày trong tương lai.");
  }

  if (errors.length > 0 || !isHangGplx(licenseClass)) {
    return { values: null, errors, invalid };
  }

  return {
    values: {
      fullName,
      phone,
      email,
      licenseNumber,
      licenseClass,
      licenseExpiresOn,
    },
    errors: [],
    invalid,
  };
}
