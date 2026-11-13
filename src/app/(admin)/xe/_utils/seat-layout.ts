import type {
  ConfigureVehicleSeatsPayload,
  VehicleSeatLayoutResponse,
} from "@/api/xe/api/types";

import {
  DEFAULT_SEAT_NAME,
  SEAT_CODE_PATTERN,
  SEAT_EMPTY,
  SEAT_FILLED,
  SEAT_LIMITS,
  type XeSeatEditorState,
} from "../_data/seats";

export type SeatGridCell = {
  key: string;
  row: number;
  col: number;
  seatCode: string;
  filled: boolean;
};

/* Khóa ô ghế theo tọa độ 1-based. */
export function seatCellKey(row: number, col: number) {
  return `${row}-${col}`;
}

/* Mã ghế một tầng: hàng là chữ cái, cột là 2 chữ số (VD A01). */
export function seatCodeFor(row: number, col: number) {
  const letter = String.fromCharCode(65 + (row - 1));
  const number = String(col).padStart(2, "0");
  return `${letter}${number}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/*
 * Điền các ô trong phạm vi rows×cols; ô chưa có giá trị nhận `fallback`.
 * - Tạo mới: fallback = SEAT_FILLED (lấp đầy lưới bằng ghế).
 * - Nạp từ API: fallback = SEAT_EMPTY vì tọa độ thiếu chính là lối đi/ô trống.
 */
export function fillCells(
  state: XeSeatEditorState,
  fallback: string
): XeSeatEditorState {
  const cells: Record<string, string> = {};
  for (let r = 1; r <= state.rows; r += 1) {
    for (let c = 1; c <= state.cols; c += 1) {
      const key = seatCellKey(r, c);
      cells[key] = state.cells[key] ?? fallback;
    }
  }
  return { ...state, cells };
}

/* Sơ đồ gợi ý khi xe chưa cấu hình: 5 hàng, cột giữa là lối đi. */
export function emptyEditorState(): XeSeatEditorState {
  const base = fillCells(
    { name: DEFAULT_SEAT_NAME, rows: 5, cols: 3, cells: {} },
    SEAT_FILLED
  );
  const cells = { ...base.cells };
  for (let r = 1; r <= base.rows; r += 1) {
    cells[seatCellKey(r, 2)] = SEAT_EMPTY;
  }
  return { ...base, cells };
}

/* Sơ đồ ghế backend → state trình cấu hình. */
export function seatLayoutFromResponse(
  response: VehicleSeatLayoutResponse
): XeSeatEditorState {
  const name = response.name?.trim() || DEFAULT_SEAT_NAME;

  /* Xe chưa cấu hình: backend trả seats rỗng → dùng sơ đồ gợi ý. */
  if (response.seats.length === 0) {
    return { ...emptyEditorState(), name };
  }

  const cells: Record<string, string> = {};
  response.seats.forEach((seat) => {
    cells[seatCellKey(seat.rowNo, seat.columnNo)] = SEAT_FILLED;
  });

  const rows = response.seats.reduce(
    (max, seat) => Math.max(max, seat.rowNo),
    1
  );
  const cols = response.seats.reduce(
    (max, seat) => Math.max(max, seat.columnNo),
    1
  );

  return fillCells(
    {
      name,
      rows: clamp(rows, SEAT_LIMITS.rows.min, SEAT_LIMITS.rows.max),
      cols: clamp(cols, SEAT_LIMITS.columns.min, SEAT_LIMITS.columns.max),
      cells,
    },
    SEAT_EMPTY
  );
}

/* Các ô của lưới, sắp theo hàng rồi cột để render grid. */
export function seatGridCells(state: XeSeatEditorState): SeatGridCell[] {
  const cells: SeatGridCell[] = [];
  for (let r = 1; r <= state.rows; r += 1) {
    for (let c = 1; c <= state.cols; c += 1) {
      const key = seatCellKey(r, c);
      cells.push({
        key,
        row: r,
        col: c,
        seatCode: seatCodeFor(r, c),
        filled: state.cells[key] === SEAT_FILLED,
      });
    }
  }
  return cells;
}

/* Số ghế thực (bỏ ô trống). */
export function countSeats(state: XeSeatEditorState) {
  return Object.values(state.cells).filter((value) => value === SEAT_FILLED)
    .length;
}

/* State → body PUT cấu hình ghế (một tầng, không hạng ghế). */
export function toSeatPayload(
  state: XeSeatEditorState
): ConfigureVehicleSeatsPayload {
  const seats: ConfigureVehicleSeatsPayload["seats"] = [];
  for (let r = 1; r <= state.rows; r += 1) {
    for (let c = 1; c <= state.cols; c += 1) {
      if (state.cells[seatCellKey(r, c)] !== SEAT_FILLED) continue;
      seats.push({ seatCode: seatCodeFor(r, c), rowNo: r, columnNo: c });
    }
  }
  return { name: state.name.trim(), seats };
}

export type SeatEditorValidation = {
  ok: boolean;
  error: string | null;
  nameInvalid: boolean;
};

/* Kiểm tra theo ràng buộc backend trước khi gửi PUT. */
export function validateSeatEditor(
  state: XeSeatEditorState
): SeatEditorValidation {
  const name = state.name.trim();
  if (!name) {
    return { ok: false, error: "Nhập tên sơ đồ ghế.", nameInvalid: true };
  }
  if (name.length > SEAT_LIMITS.nameMax) {
    return {
      ok: false,
      error: `Tên sơ đồ tối đa ${SEAT_LIMITS.nameMax} ký tự.`,
      nameInvalid: true,
    };
  }

  const payload = toSeatPayload(state);
  if (payload.seats.length === 0) {
    return {
      ok: false,
      error: "Sơ đồ cần ít nhất một ghế.",
      nameInvalid: false,
    };
  }
  if (payload.seats.length > SEAT_LIMITS.seatsMax) {
    return {
      ok: false,
      error: `Một sơ đồ tối đa ${SEAT_LIMITS.seatsMax} ghế (đang có ${payload.seats.length}).`,
      nameInvalid: false,
    };
  }

  const invalidSeat = payload.seats.find(
    (seat) =>
      !seat.seatCode ||
      seat.seatCode.length > SEAT_LIMITS.seatCodeMax ||
      !SEAT_CODE_PATTERN.test(seat.seatCode)
  );
  if (invalidSeat) {
    return {
      ok: false,
      error: `Mã ghế "${invalidSeat.seatCode}" không hợp lệ.`,
      nameInvalid: false,
    };
  }

  return { ok: true, error: null, nameInvalid: false };
}
