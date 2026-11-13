export type IconTone = "sky" | "navy" | "orange" | "green";

export type TrendTone = "good" | "bad" | "muted";

export type StatKpi = {
  id: string;
  label: string;
  icon: string;
  iconTone: IconTone;
  value: string;
  unit?: string;
  trend: TrendTone;
  trendIcon: string;
  trendText: string;
  delta: string;
  warn?: boolean;
};

export type ChartPoint = {
  label: string;
  revenue: number;
  trips: number;
  today?: boolean;
};
