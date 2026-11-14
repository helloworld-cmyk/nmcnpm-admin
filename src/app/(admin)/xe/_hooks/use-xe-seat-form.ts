"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useConfigureVehicleSeats } from "@/api/xe/tanstack/use-configure-vehicle-seats";
import { useVehicleSeats } from "@/api/xe/tanstack/use-vehicle-seats";
import { ApiError } from "@/api/types";

import {
  SEAT_EMPTY,
  SEAT_FILLED,
  type XeSeatEditorState,
} from "../_data/seats";
import {
  countSeats,
  emptyEditorState,
  fillCells,
  seatCellKey,
  seatGridCells,
  seatLayoutFromResponse,
  toSeatPayload,
  validateSeatEditor,
} from "../_utils/seat-layout";

type UseXeSeatFormOptions = {
  companyId: string;
  vehicleId: string;
  onSaved: (message: string) => void;
};

/*
 * State + nghiệp vụ trình cấu hình sơ đồ ghế một tầng: nạp sơ đồ hiện tại từ
 * API, tô ô có ghế / ô trống, dựng payload và lưu qua PUT. Component chỉ render
 * UI. Body của trình cấu hình được mount lại (key = vehicleId) mỗi khi đổi xe
 * nên state luôn khởi tạo mới, không cần effect reset.
 */
export function useXeSeatForm({
  companyId,
  vehicleId,
  onSaved,
}: UseXeSeatFormOptions) {
  const queryClient = useQueryClient();
  const seatsQuery = useVehicleSeats(companyId, vehicleId, { enabled: true });
  const configure = useConfigureVehicleSeats(companyId, vehicleId);

  const [state, setState] = useState<XeSeatEditorState>(emptyEditorState);
  const [ready, setReady] = useState(false);
  const [brush, setBrush] = useState<string>(SEAT_FILLED);
  const [error, setError] = useState<string | null>(null);
  const [nameInvalid, setNameInvalid] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const seededRef = useRef(false);

  /*
   * Nạp sơ đồ ghế hiện tại từ API một lần khi truy vấn thành công. Chỉ bật
   * `ready` sau khi đã seed để không cho lưu đè khi GET đang tải hoặc lỗi.
   */
  useEffect(() => {
    if (seededRef.current || !seatsQuery.isSuccess) return;
    seededRef.current = true;
    setState(seatLayoutFromResponse(seatsQuery.data));
    setReady(true);
  }, [seatsQuery.isSuccess, seatsQuery.data]);

  const cells = useMemo(() => seatGridCells(state), [state]);
  const totalSeats = useMemo(() => countSeats(state), [state]);

  const patchState = useCallback((patch: Partial<XeSeatEditorState>) => {
    setState((prev) => fillCells({ ...prev, ...patch }, SEAT_FILLED));
    setError(null);
    if (patch.name !== undefined) setNameInvalid(false);
  }, []);

  const paintCell = useCallback(
    (row: number, col: number) => {
      const key = seatCellKey(row, col);
      setState((prev) => ({ ...prev, cells: { ...prev.cells, [key]: brush } }));
    },
    [brush]
  );

  const paintAll = useCallback(() => {
    setState((prev) => {
      const cells: Record<string, string> = {};
      Object.keys(prev.cells).forEach((key) => {
        cells[key] = brush;
      });
      return { ...prev, cells };
    });
  }, [brush]);

  const clearAll = useCallback(() => {
    setState((prev) => {
      const cells: Record<string, string> = {};
      Object.keys(prev.cells).forEach((key) => {
        cells[key] = SEAT_EMPTY;
      });
      return { ...prev, cells };
    });
    setError(null);
  }, []);

  const submit = useCallback(async () => {
    if (!ready) {
      setError(
        "Chưa tải được sơ đồ ghế hiện tại — hãy thử lại trước khi lưu để tránh ghi đè."
      );
      return;
    }
    const result = validateSeatEditor(state);
    if (!result.ok) {
      setError(result.error);
      setNameInvalid(result.nameInvalid);
      if (result.nameInvalid) nameRef.current?.focus();
      return;
    }
    try {
      await configure.mutateAsync(toSeatPayload(state));
      await queryClient.invalidateQueries({
        queryKey: ["company-vehicle-seats", companyId, vehicleId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["company-vehicles", companyId],
      });
      onSaved(`Đã lưu sơ đồ ${countSeats(state)} ghế cho xe này.`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Có lỗi xảy ra, vui lòng thử lại."
      );
    }
  }, [ready, state, configure, queryClient, companyId, vehicleId, onSaved]);

  return {
    state,
    cells,
    brush,
    setBrush,
    totalSeats,
    error,
    nameInvalid,
    nameRef,
    ready,
    isLoading: seatsQuery.isLoading,
    loadError: seatsQuery.isError,
    saving: configure.isPending,
    refetch: seatsQuery.refetch,
    patchState,
    paintCell,
    paintAll,
    clearAll,
    submit,
  };
}
