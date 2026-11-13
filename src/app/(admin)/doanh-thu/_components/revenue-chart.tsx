"use client";

import { useMemo, useState } from "react";

import { Icon } from "@/components/icons/icon";
import { formatMillions } from "../_data/doanh-thu";
import { useDoanhThuReport } from "../_hooks/use-doanh-thu-report";

const X0 = 48;
const X1 = 704;
const Y_TOP = 20;
const Y_BASE = 208;
const SPAN_X = X1 - X0;
const SPAN_Y = Y_BASE - Y_TOP;

export function RevenueChart() {
  const { report, isLoading } = useDoanhThuReport();
  const [hovered, setHovered] = useState<number | null>(null);

  const days = useMemo(() => report?.days ?? [], [report]);
  const n = days.length;

  const geometry = useMemo(() => {
    if (n === 0) return null;
    const maxVnd = Math.max(...days.map((d) => d.vnd));
    const top = Math.max(1, Math.ceil(maxVnd / 1000000));
    const xAt = (i: number) =>
      n > 1 ? X0 + (i * SPAN_X) / (n - 1) : (X0 + X1) / 2;
    const yAt = (vnd: number) => Y_BASE - (vnd / 1000000 / top) * SPAN_Y;
    const points = days.map((d, i) => ({ x: xAt(i), y: yAt(d.vnd) }));
    const linePath = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
      .join(" ");
    const areaPath =
      n > 1
        ? `${linePath} L${points[n - 1].x},${Y_BASE} L${points[0].x},${Y_BASE} Z`
        : null;
    const step = Math.max(1, Math.round(n / 10));
    const labelIdx: number[] = [];
    for (let i = 0; i < n; i += 1) {
      if (i % step === 0) labelIdx.push(i);
    }
    if (labelIdx[labelIdx.length - 1] !== n - 1) labelIdx.push(n - 1);
    return { top, points, linePath, areaPath, labelIdx };
  }, [days, n]);

  const hoveredPoint =
    hovered !== null && geometry && days[hovered]
      ? { x: geometry.points[hovered].x, y: geometry.points[hovered].y, day: days[hovered] }
      : null;

  return (
    <article className="admin-card">
      <div className="admin-card-head">
        <div>
          <h2>Doanh thu theo ngày</h2>
          <p>
            Đơn vị: triệu đồng
            {report ? ` · kỳ ${report.rangeLabel}` : ""}
          </p>
        </div>
        <span className="badge badge--green">
          <Icon name="i-check" className="icon" />
          Chỉ vé Đã thu
        </span>
      </div>
      <div className="admin-card-body">
        {isLoading ? (
          <div className="state-loading">Đang tải biểu đồ...</div>
        ) : !geometry ? (
          <div className="state-empty">
            <span className="state-empty-icon">
              <Icon name="i-chart" className="icon" />
            </span>
            <h3>Chưa có dữ liệu biểu đồ</h3>
            <p>
              Không có chuyến nào phát sinh doanh thu trong kỳ đã chọn. Hãy
              chọn kỳ khác.
            </p>
          </div>
        ) : (
          <figure className="relative m-0">
            <svg
              viewBox="0 0 720 250"
              role="img"
              aria-label={`Doanh thu theo ngày, kỳ ${report?.rangeLabel ?? ""}`}
              className="block h-auto w-full"
              onMouseLeave={() => setHovered(null)}
            >
              <title>Doanh thu thực thu theo ngày</title>
              <g aria-hidden="true">
                {[0, 1, 2, 3].map((k) => (
                  <line
                    key={k}
                    x1={X0}
                    y1={Y_BASE - (k * SPAN_Y) / 3}
                    x2={X1}
                    y2={Y_BASE - (k * SPAN_Y) / 3}
                    stroke="var(--border)"
                    strokeWidth={1}
                  />
                ))}
              </g>
              <g aria-hidden="true">
                {[0, 1, 2, 3].map((k) => {
                  const value = (geometry.top * k) / 3;
                  return (
                    <text
                      key={k}
                      x={X0 - 8}
                      y={Y_BASE - (k * SPAN_Y) / 3 + 4}
                      textAnchor="end"
                      fontSize={11}
                      fontWeight={600}
                      fill="var(--slate-400)"
                      fontFamily="var(--font-body)"
                    >
                      {Number.isInteger(value)
                        ? value
                        : value.toFixed(1).replace(".", ",")}
                    </text>
                  );
                })}
                {geometry.labelIdx.map((i) => (
                  <text
                    key={i}
                    x={geometry.points[i].x}
                    y={232}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={600}
                    fill="var(--slate-400)"
                    fontFamily="var(--font-body)"
                  >
                    {days[i].label}
                  </text>
                ))}
              </g>
              {geometry.areaPath && (
                <path
                  d={geometry.areaPath}
                  fill="var(--sky-500)"
                  fillOpacity={0.14}
                />
              )}
              {n > 1 && (
                <path
                  d={geometry.linePath}
                  fill="none"
                  stroke="var(--sky-600)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              <g aria-hidden="true">
                {geometry.points.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={hovered === i ? 4.5 : 3.5}
                    fill="var(--surface)"
                    stroke="var(--sky-600)"
                    strokeWidth={2}
                  />
                ))}
              </g>
              {days.map((d, i) => {
                const half = n > 1 ? Math.min(32, SPAN_X / (n - 1) / 2) : 32;
                return (
                  <rect
                    key={`${d.date}-${i}`}
                    x={geometry.points[i].x - half}
                    y={0}
                    width={half * 2}
                    height={250}
                    fill="transparent"
                    onMouseEnter={() => setHovered(i)}
                  />
                );
              })}
            </svg>

            {hoveredPoint && (
              <div
                className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg bg-[var(--navy-900)] px-2.5 py-1.5 text-xs font-semibold text-white shadow-[var(--shadow-md)]"
                style={{
                  left: `${(hoveredPoint.x / 720) * 100}%`,
                  top: `${(hoveredPoint.y / 250) * 100}%`,
                  transform: "translate(-50%, -130%)",
                }}
              >
                {hoveredPoint.day.label} · {formatMillions(hoveredPoint.day.vnd)}{" "}
                triệu đồng
              </div>
            )}
          </figure>
        )}
      </div>
    </article>
  );
}
