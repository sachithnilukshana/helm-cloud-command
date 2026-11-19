import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/helm/api";
import { pageHead } from "@/lib/helm/meta";
import { PageHeader, Panel, axis, chartTooltip } from "@/components/helm/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/monitoring")({
  head: pageHead("Monitoring", "CPU, memory, network and disk metrics over time."),
  loader: ({ context }) => context.queryClient.ensureQueryData(api.metrics("24h")),
  component: Monitoring,
});

const ranges = ["1h", "6h", "24h", "7d", "30d"];

function Monitoring() {
  const [range, setRange] = useState("24h");
  const { data = [] } = useQuery(api.metrics(range));
  const chart = (title: string, keys: [string, string][], line?: boolean) => (
    <Panel title={title}><div className="h-56"><ResponsiveContainer>
      {line ? <LineChart data={data}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="t" {...axis} /><YAxis {...axis} /><Tooltip {...chartTooltip} />{keys.map(([k, c]) => <Line key={k} dataKey={k} stroke={c} dot={false} strokeWidth={1.5} />)}</LineChart>
        : <AreaChart data={data}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="t" {...axis} /><YAxis {...axis} /><Tooltip {...chartTooltip} />{keys.map(([k, c]) => <Area key={k} dataKey={k} stroke={c} fill={c} fillOpacity={0.12} />)}</AreaChart>}
    </ResponsiveContainer></div></Panel>
  );
  return (
    <div className="space-y-4">
      <PageHeader title="Monitoring" description="Fleet metrics" actions={<div className="flex rounded-md border p-0.5">{ranges.map((r) => <button key={r} onClick={() => setRange(r)} className={cn("rounded px-2.5 py-1 text-xs", r === range ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{r}</button>)}</div>} />
      <div className="grid gap-4 lg:grid-cols-2">
        {chart("CPU %", [["cpu", "var(--primary)"]])}
        {chart("Memory %", [["ram", "var(--success)"]])}
        {chart("Network KB/s", [["rx", "var(--primary)"], ["tx", "var(--warning)"]], true)}
        {chart("Disk %", [["disk", "var(--warning)"]])}
      </div>
    </div>
  );
}
