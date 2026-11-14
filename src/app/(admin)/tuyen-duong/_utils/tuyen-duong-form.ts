import type { RouteResponse } from "@/api/tuyen-duong/api/types";
import type { TuyenDuongFormValues } from "../_data/tuyen-duong";

export type TuyenDuongFormState = {
  code: string;
  originAreaId: string;
  destinationAreaId: string;
  km: string;
  min: string;
  price: string;
};

export type TuyenDuongFormInvalid = {
  code: boolean;
  origin: boolean;
  destination: boolean;
  km: boolean;
  min: boolean;
  price: boolean;
};

export type TuyenDuongFormTarget =
  | { mode: "add" }
  | { mode: "edit"; route: RouteResponse };

export type TuyenDuongFormValidation = {
  values: TuyenDuongFormValues | null;
  errors: string[];
  invalid: TuyenDuongFormInvalid;
};

export const EMPTY_TUYEN_DUONG_FORM: TuyenDuongFormState = {
  code: "",
  originAreaId: "",
  destinationAreaId: "",
  km: "",
  min: "",
  price: "",
};

const EMPTY_INVALID: TuyenDuongFormInvalid = {
  code: false,
  origin: false,
  destination: false,
  km: false,
  min: false,
  price: false,
};

/*
 * Tên tuyến chỉ để hiển thị, luôn suy ra từ tên điểm đi – điểm đến đang chọn.
 * Khi lưu, hook màn sẽ gửi kèm `name` (cùng cách suy ra) vì backend yêu cầu.
 */
export function toTuyenDuongFormState(route: RouteResponse): TuyenDuongFormState {
  return {
    code: route.code,
    originAreaId: route.originAreaId,
    destinationAreaId: route.destinationAreaId,
    km: String(route.distanceKm),
    min: String(route.durationMinutes),
    price: String(route.baseFareAmount),
  };
}

export function validateTuyenDuongForm(
  state: TuyenDuongFormState,
  routes: RouteResponse[],
  excludeId?: string
): TuyenDuongFormValidation {
  const code = state.code.trim().toUpperCase();
  const originAreaId = state.originAreaId;
  const destinationAreaId = state.destinationAreaId;
  const km = Number(state.km);
  const min = Number(state.min);
  const price = Number(state.price);

  const invalid: TuyenDuongFormInvalid = { ...EMPTY_INVALID };
  const errors: string[] = [];

  if (!code) {
    invalid.code = true;
    errors.push("Nhập mã tuyến.");
  } else if (code.length > 50) {
    invalid.code = true;
    errors.push("Mã tuyến tối đa 50 ký tự.");
  } else if (
    routes.some(
      (route) =>
        route.id !== excludeId &&
        route.code.trim().toUpperCase() === code
    )
  ) {
    invalid.code = true;
    errors.push(`Mã tuyến ${code} đã tồn tại trong danh mục.`);
  }
  if (!originAreaId) {
    invalid.origin = true;
    errors.push("Chọn điểm đi cho tuyến.");
  }
  if (!destinationAreaId) {
    invalid.destination = true;
    errors.push("Chọn điểm đến cho tuyến.");
  }
  if (originAreaId && destinationAreaId && originAreaId === destinationAreaId) {
    invalid.destination = true;
    errors.push("Điểm đến phải khác điểm đi.");
  }
  if (!state.km || km <= 0) {
    invalid.km = true;
    errors.push("Khoảng cách phải lớn hơn 0.");
  }
  if (!state.min || min <= 0) {
    invalid.min = true;
    errors.push("Thời lượng phải lớn hơn 0.");
  }
  if (!state.price || price < 0) {
    invalid.price = true;
    errors.push("Giá vé mặc định không được âm.");
  }

  if (errors.length > 0) {
    return { values: null, errors, invalid };
  }

  return {
    values: {
      code,
      originAreaId,
      destinationAreaId,
      km,
      min,
      price,
    },
    errors: [],
    invalid,
  };
}
