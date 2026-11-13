"use client";

import { Icon } from "@/components/icons/icon";
import { Reveal } from "@/components/reveal";
import { useTongQuanDashboard } from "../_hooks/use-tong-quan-dashboard";
import { DashHead } from "./dash-head";
import { DashSkeleton } from "./dash-skeleton";
import { DashStates } from "./dash-states";
import { KpiStats } from "./kpi-stats";
import { OpenIncidentsPanel } from "./open-incidents-panel";
import { RevenueChart } from "./revenue-chart";
import { TodayTripsPanel } from "./today-trips-panel";
import { TopDriversPanel } from "./top-drivers-panel";
import { TopRoutesPanel } from "./top-routes-panel";

const ROW_TWO_CLASS =
  "mt-3.5 grid grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] gap-3.5 max-[1024px]:grid-cols-1";

const REVEAL_CLASS = "min-w-0";

export function TongQuanDashboard() {
  const {
    companyId,
    companyHydrated,
    isLoading,
    isError,
    error,
    kpis,
    points,
    drivers,
    todayTrips,
    topRoutes,
    incidents,
    reload,
  } = useTongQuanDashboard();

  if (!companyHydrated) {
    return <DashSkeleton />;
  }

  if (companyId.length === 0) {
    return (
      <div className="state-empty">
        <span className="state-empty-icon" aria-hidden="true">
          <Icon name="i-alert" className="icon" />
        </span>
        <h3>Chưa chọn hãng quản lý</h3>
        <p>Chọn hãng đang quản lý để xem bảng điều khiển.</p>
      </div>
    );
  }

  if (isLoading) {
    return <DashSkeleton />;
  }

  if (isError) {
    return <DashStates error={error} onReload={reload} />;
  }

  return (
    <div>
      <DashHead onRefresh={reload} />
      <KpiStats items={kpis} />

      <section className="mt-3.5" aria-label="Hoạt động">
        <Reveal className={REVEAL_CLASS}>
          <RevenueChart points={points} />
        </Reveal>
      </section>

      <section className="mt-3.5" aria-label="Chuyến hôm nay">
        <Reveal className={REVEAL_CLASS}>
          <TodayTripsPanel rows={todayTrips} />
        </Reveal>
      </section>

      <section className={ROW_TWO_CLASS} aria-label="Top tuyến và top tài xế">
        <Reveal className={REVEAL_CLASS}>
          <TopRoutesPanel rows={topRoutes} />
        </Reveal>
        <Reveal className={REVEAL_CLASS}>
          <TopDriversPanel drivers={drivers} />
        </Reveal>
      </section>

      <section className="mt-3.5" aria-label="Sự cố đang mở">
        <Reveal className={REVEAL_CLASS}>
          <OpenIncidentsPanel rows={incidents} />
        </Reveal>
      </section>
    </div>
  );
}
