"use client";

import { useEffect, useRef, useState } from "react";

import { buildDailyCsv } from "../_data/doanh-thu";
import type { DoanhThuReport } from "../_utils/map-report";

const STATUS_MS = 4000;

export function useDoanhThuExport(report: DoanhThuReport | null) {
  const [exportOpen, setExportOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

  const openExport = () => setExportOpen(true);
  const closeExport = () => setExportOpen(false);

  const exportCsv = () => {
    if (!report) return;
    const fileName = `doanh-thu-${report.from.slice(0, 7) || "ky"}.csv`;
    const blob = new Blob([buildDailyCsv(report.days)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setExportOpen(false);
    setStatus(`Đã xuất CSV: ${fileName}`);
    timersRef.current.push(window.setTimeout(() => setStatus(null), STATUS_MS));
  };

  return { exportOpen, openExport, closeExport, status, exportCsv };
}
