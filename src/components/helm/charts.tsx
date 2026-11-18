import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MetricPoint } from "@/lib/helm/types";
import { axis, chartTooltip } from "./ui";

type Series = { key: keyof MetricPoint; name: string; color: string };
export function MetricChart({ data, series, unit = "%", height = 240 }: { data: MetricPoint[]; series: Series[]; unit?: string; height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>{series.map((s) => <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={s.color} stopOpacity={0.3} /><stop offset="100%" stopColor={s.color} stopOpacity={0} /></linearGradient>)}</defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="t" {...axis} tickFormatter={(v) => `${v}`} />
          <YAxis {...axis} unit={unit} />
          <Tooltip {...chartTooltip} formatter={(v: number) => `${v}${unit}`} />
          <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
          {series.map((s) => <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={1.75} fill={`url(#g-${s.key})`} />)}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
