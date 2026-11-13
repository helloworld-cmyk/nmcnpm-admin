import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { PageHead } from "./_components/page-head";
import { PeriodFilter } from "./_components/period-filter";
import { SummaryCards } from "./_components/summary-cards";
import { RevenueChart } from "./_components/revenue-chart";
import { RouteBreakdown } from "./_components/route-breakdown";
import { ReconTable } from "./_components/recon-table";
import "./_components/doanh-thu.css";

export const metadata: Metadata = {
  title: "Doanh thu — Quản trị Vi Vu Việt",
  description:
    "Doanh thu thực thu theo kỳ và bảng đối soát theo chuyến cho quản trị viên Vi Vu Việt.",
};

const SECTION_GAP = "mt-6 max-[640px]:mt-[18px]";

export default async function DoanhThuPage(props: PageProps<"/doanh-thu">) {
  await props.params;

  return (
    <div>
      <Reveal>
        <PageHead />
      </Reveal>
      <Reveal>
        <PeriodFilter />
      </Reveal>
      <Reveal className={SECTION_GAP}>
        <SummaryCards />
      </Reveal>
      <Reveal className={SECTION_GAP}>
        <div className="grid grid-cols-[1.55fr_1fr] items-start gap-4 max-[1024px]:grid-cols-1">
          <RevenueChart />
          <RouteBreakdown />
        </div>
      </Reveal>
      <Reveal className={SECTION_GAP}>
        <ReconTable />
      </Reveal>
    </div>
  );
}
