"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Icon } from "@/components/icons/icon";
import type { ChartPoint } from "../_data/tong-quan";

const VIEW_W = 720;
const VIEW_H = 260;
const X_START = 48;
const X_END = 704;
const BASE_Y = 212;
const TOP_Y = 18;
const BAR_W = 16;
const HIT_R = 14;

const round1 = (v: number) => Math.round(v * 10) / 10;

const fmtRevenue = (v: number) =>
  v.toLocaleString("vi-VN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

const GRID_LINE_CLASS = "stroke-[var(--border-soft)]";
const LABEL_CLASS = "fill-[var(--slate-400)] text-[11px]";
const BAR_CLASS = "fill-[var(--sky-100)]";
const DOT_CLASS =
  "pointer-events-none fill-[var(--sky-700)] stroke-[var(--surface)]";
const HIT_CLASS =
  "cursor-pointer fill-[transparent] outline-none focus-visible:stroke-[var(--sky-500)] focus-visible:[stroke-dasharray:3_3]";

const LEGEND_KEY_CLASS =
  "inline-flex items-center gap-2 text-xs font-semibold text-[var(--slate-600)]";

type TipState = { x: number; y: number; point: ChartPoint };

export function RevenueChart({ points }: { points: ChartPoint[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<TipState | null>(null);

  useEffect(() => {
    if (!tip) return;
    const hide = () => setTip(null);
    window.addEventListener("scroll", hide, { passive: true });
    window.addEventListener("resize", hide);
    return () => {
      window.removeEventListener("scroll", hide);
      window.removeEventListener("resize", hide);
    };
  }, [tip]);

  const hasRevenue = points.some((point) => point.revenue > 0);
  const totalTrips = points.reduce((sum, point) => sum + point.trips, 0);

  const geometry = useMemo(() => {
    const n = points.length;
    if (n === 0) return null;
    const revMax = Math.max(1, hasRevenue ? Math.max(...points.map((p) => p.revenue)) : 1);
    const tripMax = Math.max(1, Math.max(...points.map((p) => p.trips)));
    const xAt = (i: number) =>
      n > 1 ? X_START + (i * (X_END - X_START)) / (n - 1) : (X_START + X_END) / 2;
    const revY = (v: number) =>
      round1(BASE_Y - (v * (BASE_Y - TOP_Y)) / revMax);
    const dots = points.map((point, i) => {
      const barH = round1((point.trips * (BASE_Y - TOP_Y)) / tripMax);
      return {
        ...point,
        x: round1(xAt(i)),
        y: revY(point.revenue),
        barTop: round1(BASE_Y - barH),
        barH,
      };
    });
    const linePath = `M${dots.map((d) => `${d.x} ${d.y}`).join("L")}`;
    const areaPath = `${linePath}L${X_END} ${BASE_Y}L${X_START} ${BASE_Y}Z`;
    return { dots, revMax, gridValues: [0, 1, 2, 3].map((k) => (revMax * k) / 3), linePath, areaPath };
  }, [points, hasRevenue]);

  const showTip = (point: ChartPoint, el: Element) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const wrapBox = wrap.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    const x = Math.max(
      76,
      Math.min(box.left - wrapBox.left + box.width / 2, wrapBox.width - 76)
    );
    setTip({ x, y: box.top - wrapBox.top, point });
  };

  return (
    <article className="tq-panel">
      <div className="tq-panel-head">
        <div>
          <h2 className="tq-panel-title">Hoạt động chuyến đi</h2>
          <p className="tq-panel-sub">
            {points.length > 0
              ? `${points.length} ngày gần nhất`
              : "Chưa có dữ liệu trong kỳ"}
          </p>
        </div>
        <span className="badge badge--green">
          <Icon name="i-check" className="icon" />
          {totalTrips} chuyến
        </span>
      </div>

      <div className="mb-3 flex flex-wrap gap-x-[18px] gap-y-2">
        {hasRevenue && (
          <span className={LEGEND_KEY_CLASS}>
            <i
              aria-hidden="true"
              className="h-[3px] w-[18px] rounded-[3px] bg-[var(--sky-600)]"
            />
            Doanh thu (triệu đ)
          </span>
        )}
        <span className={LEGEND_KEY_CLASS}>
          <i
            aria-hidden="true"
            className="h-3 w-2.5 rounded-[3px] bg-[var(--sky-100)] shadow-[inset_0_0_0_1px_var(--sky-300)]"
          />
          Số chuyến
        </span>
      </div>

      {!geometry ? (
        <div className="state-empty">
          <span className="state-empty-icon">
            <Icon name="i-chart" className="icon" />
          </span>
          <h3>Chưa có dữ liệu chuyến</h3>
          <p>Không có chuyến nào phát sinh trong kỳ đã chọn.</p>
        </div>
      ) : (
        <div ref={wrapRef} className="relative">
          <svg
            className="block h-auto min-h-[210px] w-full"
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            role="img"
            aria-label={`Số chuyến theo ngày, ${totalTrips} chuyến trong kỳ`}
          >
            <g className={GRID_LINE_CLASS}>
              {geometry.gridValues.map((v, k) => {
                const y = round1(BASE_Y - ((v * (BASE_Y - TOP_Y)) / geometry.revMax) * 1);
                return <line key={k} x1={X_START} y1={y} x2={X_END} y2={y} />;
              })}
            </g>
            {hasRevenue && (
              <g className={LABEL_CLASS}>
                {geometry.gridValues.map((v, k) => {
                  const y = round1(BASE_Y - ((v * (BASE_Y - TOP_Y)) / geometry.revMax) * 1);
                  return (
                    <text key={k} x={40} y={y + 3.5} textAnchor="end">
                      {Number.isInteger(v) ? v : v.toFixed(1).replace(".", ",")}
                    </text>
                  );
                })}
              </g>
            )}
            <g className={BAR_CLASS}>
              {geometry.dots.map((d) => (
                <rect
                  key={d.label}
                  x={d.x - BAR_W / 2}
                  y={d.barTop}
                  width={BAR_W}
                  height={d.barH}
                  rx={3}
                />
              ))}
            </g>
            {hasRevenue && (
              <>
                <path className="fill-[rgba(14,165,233,0.14)]" d={geometry.areaPath} />
                <path
                  className="fill-none stroke-[var(--sky-600)]"
                  strokeWidth={2.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={geometry.linePath}
                />
                <g className={DOT_CLASS} strokeWidth={2}>
                  {geometry.dots.map((d) => (
                    <circle key={d.label} cx={d.x} cy={d.y} r={d.today ? 4.5 : 3.5} />
                  ))}
                </g>
              </>
            )}
            <g className={LABEL_CLASS}>
              {geometry.dots
                .filter((_, i) => i % 2 === 0)
                .map((d) => (
                  <text key={d.label} x={d.x} y={238} textAnchor="middle">
                    {d.label}
                  </text>
                ))}
            </g>
            <g>
              {geometry.dots.map((d) => (
                <circle
                  key={d.label}
                  className={HIT_CLASS}
                  cx={d.x}
                  cy={d.y}
                  r={HIT_R}
                  tabIndex={0}
                  role="button"
                  aria-label={`${d.label}: ${d.trips} chuyến`}
                  onMouseEnter={(e) => showTip(d, e.currentTarget)}
                  onFocus={(e) => showTip(d, e.currentTarget)}
                  onMouseLeave={() => setTip(null)}
                  onBlur={() => setTip(null)}
                />
              ))}
            </g>
          </svg>
          <div
            className="pointer-events-none absolute z-[5] min-w-[132px] rounded-[10px] bg-[var(--navy-900)] px-[11px] py-2 shadow-[var(--shadow-md)] transition-opacity duration-[0.24s] ease-[var(--ease)]"
            style={{
              transform: "translate(-50%, calc(-100% - 12px))",
              left: tip ? tip.x : 0,
              top: tip ? tip.y : 0,
              opacity: tip ? 1 : 0,
            }}
            aria-hidden={!tip}
          >
            <strong className="block whitespace-nowrap [font-family:var(--font-heading)] text-[13px] font-bold text-white">
              {tip ? `${tip.point.trips} chuyến` : ""}
            </strong>
            <span className="block whitespace-nowrap text-[11.5px] text-[var(--sky-300)]">
              {tip
                ? hasRevenue
                  ? `${tip.point.label} · ${fmtRevenue(tip.point.revenue)} triệu đ`
                  : tip.point.label
                : ""}
            </span>
          </div>
        </div>
      )}
    </article>
  );
}
