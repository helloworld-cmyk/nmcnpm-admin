"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ToastData } from "@/components/ui/toast";
import { useXeFiltersStore } from "@/global-states/xe-filters-store";
import {
  INITIAL_VEHICLES,
  type Xe,
  type XeFormValues,
} from "../_data/vehicles";
import {
  XE_PAGE_SIZE,
  computePageCount,
  computeXeStats,
  filterVehicles,
  sortVehicles,
  type XeStatsData,
} from "../_utils/xe-list";

type UseXeVehiclesResult = {
  vehicles: Xe[];
  filteredCount: number;
  rows: Xe[];
  rangeStart: number;
  rangeEnd: number;
  pageCount: number;
  page: number;
  stats: XeStatsData;
  toast: ToastData | null;
  clearToast: () => void;
  addVehicle: (values: XeFormValues) => void;
  updateVehicle: (id: string, values: XeFormValues) => void;
  removeVehicle: (id: string) => void;
};

export function useXeVehicles(): UseXeVehiclesResult {
  const [vehicles, setVehicles] = useState<Xe[]>(INITIAL_VEHICLES);
  const [toast, setToast] = useState<ToastData | null>(null);
  const nextIdRef = useRef(INITIAL_VEHICLES.length + 1);

  const search = useXeFiltersStore((s) => s.search);
  const soCho = useXeFiltersStore((s) => s.soCho);
  const trangThai = useXeFiltersStore((s) => s.trangThai);
  const page = useXeFiltersStore((s) => s.page);
  const sortKey = useXeFiltersStore((s) => s.sortKey);
  const sortDir = useXeFiltersStore((s) => s.sortDir);
  const setPage = useXeFiltersStore((s) => s.setPage);

  const filtered = useMemo(
    () => filterVehicles(vehicles, { search, soCho, trangThai }),
    [vehicles, search, soCho, trangThai]
  );

  const sorted = useMemo(
    () => sortVehicles(filtered, sortKey, sortDir),
    [filtered, sortKey, sortDir]
  );

  const pageCount = computePageCount(sorted.length);
  const safePage = Math.min(page, pageCount);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount, setPage]);

  const start = (safePage - 1) * XE_PAGE_SIZE;
  const rows = sorted.slice(start, start + XE_PAGE_SIZE);

  const stats = useMemo(() => computeXeStats(vehicles), [vehicles]);

  const clearToast = () => setToast(null);

  const addVehicle = (values: XeFormValues) => {
    const xe: Xe = {
      id: `xe-moi-${nextIdRef.current}`,
      ...values,
      daGanChuyen: false,
    };
    nextIdRef.current += 1;
    setVehicles((prev) => [...prev, xe]);
    setPage(computePageCount(sorted.length + 1));
    setToast({
      message: `Đã thêm xe ${values.bienSo} vào đội xe.`,
      type: "success",
    });
  };

  const updateVehicle = (id: string, values: XeFormValues) => {
    setVehicles((prev) =>
      prev.map((xe) => (xe.id === id ? { ...xe, ...values } : xe))
    );
    setToast({
      message: `Đã lưu thay đổi cho xe ${values.bienSo}.`,
      type: "success",
    });
  };

  const removeVehicle = (id: string) => {
    const target = vehicles.find((xe) => xe.id === id);
    setVehicles((prev) => prev.filter((xe) => xe.id !== id));
    setToast({
      message: `Đã xóa xe ${target?.bienSo ?? id} khỏi đội xe.`,
      type: "success",
    });
  };

  return {
    vehicles,
    filteredCount: sorted.length,
    rows,
    rangeStart: rows.length > 0 ? start + 1 : 0,
    rangeEnd: start + rows.length,
    pageCount,
    page: safePage,
    stats,
    toast,
    clearToast,
    addVehicle,
    updateVehicle,
    removeVehicle,
  };
}
