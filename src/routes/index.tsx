import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Activity, Archive, Boxes, Cpu, HardDrive, MemoryStick, Network, RefreshCw, Rocket, ShieldAlert, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/helm/api";
import { pageHead } from "@/lib/helm/meta";
import { MetricChart } from "@/components/helm/charts";
import { useActiveServer } from "@/components/helm/shell";
import { Meter, Panel, StatCard, StatusBadge, TableWrap, td, th, timeAgo } from "@/components/helm/ui";

export const Route = createFileRoute("/")({
  head: pageHead("Overview", "Live health, deployments and resource usage across your HELM servers."),
  loader: ({ context: { queryClient: q } }) => Promise.all([q.ensureQueryData(api.servers), q.ensureQueryData(api.projects), q.ensureQueryData(api.deployments), q.ensureQueryData(api.metrics("24h")), q.ensureQueryData(api.processes), q.ensureQueryData(api.activity)]),
  component: Overview,
});

const activityIcon = { deploy: Rocket, alert: Activity, security: ShieldAlert, error: XCircle, backup: Archive };

function Overview() {
  const qc = useQueryClient();
  const { serverId } = useActiveServer();
  const { data: servers } = useSuspenseQuery(api.servers);
  const { data: projects } = useSuspenseQuery(api.projects);
  const { data: deps } = useSuspenseQuery(api.deployments);
  const { data: metrics, dataUpdatedAt } = useSuspenseQuery(api.metrics("24h"));
  const { data: procs } = useSuspenseQuery(api.processes);
  const { data: activity } = useSuspenseQuery(api.activity);
  const [refreshing, setRefreshing] = useState(false);
  const server = (servers.find((s) => s.id === serverId) ?? servers[0])!;
  const col = (k: "cpu" | "ram" | "disk" | "rx") => metrics.map((m) => m[k]);
  const live = projects.filter((p) => p.status === "live");

  const refresh = async () => { setRefreshing(true); await qc.invalidateQueries({ queryKey: ["helm"] }); setRefreshing(false); toast.success("Metrics refreshed"); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Good evening, Sachith</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Infrastructure overview</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="font-mono text-foreground">{server.name}</span><StatusBadge status={server.status} label={server.status === "online" ? "Connected" : server.status} />
            <span>·</span><span>Updated {new Date(dataUpdatedAt).toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh} disabled={refreshing}><RefreshCw className={refreshing ? "animate-spin" : ""} />Refresh</Button>
          <Button asChild className="glow"><Link to="/deployments" search={{ deploy: true }}><Rocket />Quick deploy</Link></Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <StatCard label="CPU" value={server.cpu} unit="%" trend={4.2} icon={Cpu} spark={col("cpu")} progress={server.cpu} />
        <StatCard label="Memory" value={server.ram} unit="%" trend={1.1} icon={MemoryStick} spark={col("ram")} progress={server.ram} />
        <StatCard label="Disk" value={server.disk} unit="%" trend={0.6} icon={HardDrive} spark={col("disk")} progress={server.disk} />
        <StatCard label="Network" value={metrics.at(-1)!.rx} unit="Mb/s" trend={-8.3} icon={Network} spark={col("rx")} progress={Math.round(metrics.at(-1)!.rx / 10)} />
        <StatCard label="Active apps" value={live.length} unit={`/ ${projects.length}`} trend={0} icon={Boxes} spark={[3, 3, 4, 4, 4, 3, 4, 4, live.length]} progress={(live.length / projects.length) * 100} />
        <StatCard label="Deployments" value={1284} unit="total" trend={12.5} icon={Rocket} spark={[8, 12, 9, 14, 11, 16, 13, 18, 15]} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="CPU & memory · 24h"><MetricChart data={metrics} series={[{ key: "cpu", name: "CPU", color: "var(--chart-1)" }, { key: "ram", name: "RAM", color: "var(--chart-3)" }]} /></Panel>
        <Panel title="Network traffic · 24h"><MetricChart unit=" Mb/s" data={metrics} series={[{ key: "rx", name: "Inbound", color: "var(--chart-2)" }, { key: "tx", name: "Outbound", color: "var(--chart-4)" }]} /></Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Recent deployments" action={<Link to="/deployments" className="text-xs text-primary hover:underline">View all</Link>}>
          <TableWrap>
            <thead><tr><th className={th}>Project</th><th className={th}>Commit</th><th className={th}>Status</th><th className={th}>Duration</th><th className={th}>When</th></tr></thead>
            <tbody>{deps.history.slice(0, 5).map((d) => (
              <tr key={d.id}><td className={td}>{d.project}</td><td className={td}><span className="font-mono text-xs text-primary">{d.commit}</span> <span className="text-muted-foreground">{d.message}</span></td><td className={td}><StatusBadge status={d.status} /></td><td className={td + " tabular-nums"}>{d.durationSec}s</td><td className={td + " text-muted-foreground"}>{timeAgo(d.createdAt)}</td></tr>
            ))}</tbody>
          </TableWrap>
        </Panel>
        <Panel title="Server health">
          <ul className="space-y-3">{servers.map((s) => (
            <li key={s.id}><Link to="/servers/$id" params={{ id: s.id }} className="block rounded-md p-1 hover:bg-accent">
              <div className="flex items-center justify-between text-sm"><span className="font-mono text-xs">{s.name}</span><StatusBadge status={s.status} /></div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                {(["cpu", "ram", "disk"] as const).map((k) => <div key={k}><span className="uppercase">{k}</span> {s[k]}%<Meter value={s[k]} className="mt-1" /></div>)}
              </div>
            </Link></li>
          ))}</ul>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Running applications">
          <ul className="divide-y">{live.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-2.5"><span className="size-2 rounded-full bg-success" /><div className="min-w-0 flex-1"><p className="text-sm">{p.name}</p><a href={`https://${p.url}`} target="_blank" rel="noreferrer" className="truncate font-mono text-xs text-muted-foreground hover:text-primary">{p.url}</a></div><span className="text-xs text-muted-foreground">{p.framework}</span></li>
          ))}</ul>
        </Panel>
        <Panel title="Top processes">
          <TableWrap><thead><tr><th className={th}>Process</th><th className={th}>CPU</th><th className={th}>MEM</th></tr></thead>
            <tbody>{procs.map((p) => <tr key={p.pid}><td className={td}><span className="block max-w-[220px] truncate font-mono text-xs">{p.name}</span></td><td className={td + " tabular-nums"}>{p.cpu}%</td><td className={td + " tabular-nums"}>{p.mem}%</td></tr>)}</tbody>
          </TableWrap>
        </Panel>
        <Panel title="Recent activity">
          <ol className="space-y-3">{activity.map((a) => { const I = activityIcon[a.kind]; return (
            <li key={a.id} className="flex gap-3"><span className="mt-0.5 rounded-md border bg-muted p-1.5"><I className={`size-3.5 ${a.kind === "error" ? "text-destructive" : a.kind === "alert" ? "text-warning" : "text-primary"}`} /></span><div><p className="text-sm">{a.text}</p><p className="text-xs text-muted-foreground">{timeAgo(a.at)}</p></div></li>
          ); })}</ol>
        </Panel>
      </div>
    </div>
  );
}
