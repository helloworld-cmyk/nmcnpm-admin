import { Reveal } from "@/components/reveal";
import type { StatKpi } from "../_data/tong-quan";
import { StatCard } from "./stat-card";

export function KpiStats({ items }: { items: StatKpi[] }) {
  return (
    <section aria-label="Chỉ số chính hôm nay">
      <h2 className="sr-only">Chỉ số chính hôm nay</h2>
      <Reveal className="grid grid-cols-2 gap-3.5 min-[700px]:grid-cols-3 min-[1320px]:grid-cols-6">
        {items.map((kpi) => (
          <StatCard key={kpi.id} kpi={kpi} />
        ))}
      </Reveal>
    </section>
  );
}
