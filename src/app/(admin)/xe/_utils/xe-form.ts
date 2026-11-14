import type { Xe, XeFormValues } from "../_data/vehicles";

export type XeFormState = {
  bienSo: string;
  loaiXe: string;
  soCho: string;
  trangThai: XeFormValues["trangThai"];
};

export type XeFormInvalid = {
  bienSo: boolean;
  loaiXe: boolean;
  soCho: boolean;
};

export type XeFormTarget = { mode: "add" } | { mode: "edit"; xe: Xe };

export type XeFormValidation = {
  values: XeFormValues | null;
  errors: string[];
  invalid: XeFormInvalid;
};

export const EMPTY_XE_FORM: XeFormState = {
  bienSo: "",
  loaiXe: "",
  soCho: "",
  trangThai: "Đang hoạt động",
};

const SO_CHO_MIN = 1;
const SO_CHO_MAX = 50;

export function toXeFormState(xe: Xe): XeFormState {
  return {
    bienSo: xe.bienSo,
    loaiXe: xe.loaiXe,
    soCho: String(xe.soCho),
    trangThai: xe.trangThai,
  };
}

function normalizePlate(plate: string) {
  return plate.toLowerCase().replace(/\s+/g, "");
}

export function validateXeForm(
  state: XeFormState,
  vehicles: Xe[],
  excludeId?: string
): XeFormValidation {
  const bienSo = state.bienSo.trim();
  const loaiXe = state.loaiXe.trim();
  const soCho = Number(state.soCho);
  const errors: string[] = [];
  const invalid: XeFormInvalid = { bienSo: false, loaiXe: false, soCho: false };

  if (!bienSo) {
    invalid.bienSo = true;
    errors.push("Nhập biển số xe.");
  } else {
    const duplicated = vehicles.some(
      (xe) =>
        xe.id !== excludeId &&
        normalizePlate(xe.bienSo) === normalizePlate(bienSo)
    );
    if (duplicated) {
      invalid.bienSo = true;
      errors.push(`Biển số ${bienSo} đã tồn tại trong đội xe.`);
    }
  }

  if (!loaiXe) {
    invalid.loaiXe = true;
    errors.push("Nhập loại xe.");
  }

  if (!soCho || soCho < SO_CHO_MIN || soCho > SO_CHO_MAX) {
    invalid.soCho = true;
    errors.push("Sức chứa phải từ 1 đến 50 chỗ.");
  }

  if (errors.length > 0) {
    return { values: null, errors, invalid };
  }

  return {
    values: {
      bienSo,
      loaiXe,
      soCho,
      trangThai: state.trangThai,
    },
    errors: [],
    invalid,
  };
}
