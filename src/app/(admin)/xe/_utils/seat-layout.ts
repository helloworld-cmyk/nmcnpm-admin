import type {
  ConfigureVehicleSeatsPayload,
  VehicleSeatLayoutResponse,
} from "@/api/xe/api/types";

import {
  DEFAULT_SEAT_NAME,
  SEAT_CLASS_OPTIONS,
  SEAT_CODE_PATTERN,
  SEAT_EMPTY,
  SEAT_LIMITS,
  type XeSeatEditorState,
} from "../_data/seats";

export type SeatGridCell = {
  key: string;
  deck: number;
  row: number;
  col: number;
  seatCode: string;
  seatClass: string;
};

/* Khóa ô ghế theo tọa độ 1-based. */
export function seatCellKey(deck: number, row: number, col: number) {
  return `${deck}-${row}-${col}`;
}

/* Mã ghế: 1 tầng dùng A01; nhiều tầng ghép thêm tiền tố T1/T2 để không trùng. */
export function seatCodeFor(
  deck: number,
  row: number,
  col: number,
  decks: number
) {
  const letter = String.fromCharCode(65 + (row - 1));
  const number = String(col).padStart(2, "0");
  return decks > 1 ? `T${deck}${letter}${number}` : `${letter}${number}`;
}

export function defaultSeatClass() {
  return SEAT_CLASS_OPTIONS[0].value;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/*
 * Điền các ô trong phạm vi decks×rows×cols; ô chưa có giá trị nhận `fallback`.
 * - Tạo mới: fallback = hạng ghế mặc định (lấp đầy lưới).
 * - Nạp từ API: fallback = SEAT_EMPTY vì tọa độ thiếu chính là lối đi/ô trống.
 */
export function fillCells(
  state: XeSeatEditorState,
  fallback: string
): XeSeatEditorState {
  const cells: Record<string, string> = {};
  for (let d = 1; d <= state.decks; d += 1) {
    for (let r = 1; r <= state.rows; r += 1) {
      for (let c = 1; c <= state.cols; c += 1) {
        const key = seatCellKey(d, r, c);
        cells[key] = state.cells[key] ?? fallback;
      }
    }
  }
  return { ...state, cells };
}

/* Sơ đồ gợi ý khi xe chưa cấu hình: 1 tầng, 5 hàng, cột giữa là lối đi. */
export function emptyEditorState(): XeSeatEditorState {
  const base = fillCells(
    { name: DEFAULT_SEAT_NAME, decks: 1, rows: 5, cols: 3, cells: {} },
    defaultSeatClass()
  );
  const cells = { ...base.cells };
  for (let r = 1; r <= base.rows; r += 1) {
    cells[seatCellKey(1, r, 2)] = SEAT_EMPTY;
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
    cells[seatCellKey(seat.deck, seat.rowNo, seat.columnNo)] = seat.seatClass;
  });

  const decks = response.seats.reduce((max, seat) => Math.max(max, seat.deck), 1);
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
      decks: clamp(decks, SEAT_LIMITS.decks.min, SEAT_LIMITS.decks.max),
      rows: clamp(rows, SEAT_LIMITS.rows.min, SEAT_LIMITS.rows.max),
      cols: clamp(cols, SEAT_LIMITS.columns.min, SEAT_LIMITS.columns.max),
      cells,
    },
    SEAT_EMPTY
  );
}

/* Các ô của một tầng, sắp theo hàng rồi cột để render grid. */
export function deckSeatCells(
  state: XeSeatEditorState,
  deck: number
): SeatGridCell[] {
  const cells: SeatGridCell[] = [];
  for (let r = 1; r <= state.rows; r += 1) {
    for (let c = 1; c <= state.cols; c += 1) {
      const key = seatCellKey(deck, r, c);
      cells.push({
        key,
        deck,
        row: r,
        col: c,
        seatCode: seatCodeFor(deck, r, c, state.decks),
        seatClass: state.cells[key] ?? SEAT_EMPTY,
      });
    }
  }
  return cells;
}

/* Số ghế thực (bỏ ô trống). */
export function countSeats(state: XeSeatEditorState) {
  return Object.values(state.cells).filter(
    (seatClass) => seatClass && seatClass !== SEAT_EMPTY
  ).length;
}

/* State → body PUT cấu hình ghế. */
export function toSeatPayload(
  state: XeSeatEditorState
): ConfigureVehicleSeatsPayload {
  const seats: ConfigureVehicleSeatsPayload["seats"] = [];
  for (let d = 1; d <= state.decks; d += 1) {
    for (let r = 1; r <= state.rows; r += 1) {
      for (let c = 1; c <= state.cols; c += 1) {
        const seatClass = state.cells[seatCellKey(d, r, c)];
        if (!seatClass || seatClass === SEAT_EMPTY) continue;
        seats.push({
          seatCode: seatCodeFor(d, r, c, state.decks),
          seatClass,
          deck: d,
          rowNo: r,
          columnNo: c,
        });
      }
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
      !SEAT_CODE_PATTERN.test(seat.seatCode) ||
      !seat.seatClass ||
      seat.seatClass.length > SEAT_LIMITS.seatClassMax
  );
  if (invalidSeat) {
    return {
      ok: false,
      error: `Mã ghế "${invalidSeat.seatCode}" hoặc hạng ghế không hợp lệ.`,
      nameInvalid: false,
    };
  }

  return { ok: true, error: null, nameInvalid: false };
}
