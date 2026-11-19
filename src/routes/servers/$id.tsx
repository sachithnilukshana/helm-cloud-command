import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Power, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/helm/api";
import { Badge, Confirm, Meter, PageHeader, Panel, StatusBadge, axis, chartTooltip } from "@/components/helm/ui";
import { DataTable } from "@/components/helm/table";

export const Route = createFileRoute("/servers/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} · Servers · HELM` }, { name: "description", content: "Server health, processes and containers." }, { property: "og:title", content: `${params.id} · HELM` }, { property: "og:description", content: "Server health, processes and containers." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  loader: async ({ context, params }) => {
    const list = await context.queryClient.ensureQueryData(api.servers);
    if (!list.some((s) => s.id === params.id)) throw notFound();
    await Promise.all([context.queryClient.ensureQueryData(api.metrics("24h")), context.queryClient.ensureQueryData(api.processes), context.queryClient.ensureQueryData(api.containers)]);
  },
  notFoundComponent: () => <Panel><p className="text-sm">Server not found. <Link to="/servers" className="text-primary hover:underline">All servers</Link></p></Panel>,
  component: ServerDetail,
});

function ServerDetail() {
  const { id } = Route.useParams();
  const s = useSuspenseQuery(api.servers).data.find((x) => x.id === id)!;
  const { data: m } = useSuspenseQuery(api.metrics("24h"));
  const { data: procs } = useSuspenseQuery(api.processes);
  const { data: cons } = useSuspenseQuery(api.containers);
  return (
    <div className="space-y-4">
      <PageHeader title={s.name} description={`${s.ip} · ${s.region} · ${s.os}`}
        actions={<>
          <StatusBadge status={s.status} />
          <Confirm trigger={<Button variant="outline"><RotateCw className="size-4" />Reboot</Button>} title={`Reboot ${s.name}?`} description="Running apps will be briefly unavailable." confirmLabel="Reboot" onConfirm={() => toast.success(`${s.name} rebooting`)} />
          <Confirm trigger={<Button variant="outline"><Power className="size-4" />Shut down</Button>} destructive title={`Shut down ${s.name}?`} description="All services on this server will stop." confirmLabel="Shut down" onConfirm={() => toast.success(`${s.name} shutting down`)} />
        </>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {([["CPU", s.cpu, `${s.cores} vCPU`], ["Memory", s.ram, `${s.ramGb} GB`], ["Disk", s.disk, `${s.storageGb} GB`]] as const).map(([l, v, sub]) => (
          <Panel key={l}><p className="text-xs uppercase tracking-wider text-muted-foreground">{l}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{v}%</p><Meter value={v} className="mt-2" /><p className="mt-2 text-xs text-muted-foreground">{sub}</p></Panel>
        ))}
        <Panel><p className="text-xs uppercase tracking-wider text-muted-foreground">Uptime</p><p className="mt-1 text-2xl font-semibold">{s.uptimeDays}d</p><p className="mt-2 text-xs text-muted-foreground">Docker <StatusBadge status={s.docker} /></p></Panel>
      </div>
      <Panel title="CPU & memory · 24h">
        <div className="h-64"><ResponsiveContainer><AreaChart data={m}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="t" {...axis} /><YAxis {...axis} /><Tooltip {...chartTooltip} />
          <Area dataKey="cpu" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} /><Area dataKey="ram" stroke="var(--success)" fill="var(--success)" fillOpacity={0.1} /></AreaChart></ResponsiveContainer></div>
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Processes"><DataTable rows={procs.map((p) => ({ ...p, id: p.pid }))} cols={[{ h: "PID", c: (p) => <span className="font-mono text-xs">{p.pid}</span> }, { h: "Command", c: (p) => <span className="font-mono text-xs">{p.name}</span> }, { h: "CPU", c: (p) => `${p.cpu}%` }, { h: "Mem", c: (p) => `${p.mem}%` }]} /></Panel>
        <Panel title="Containers"><DataTable rows={cons} cols={[{ h: "Name", c: (c) => <span className="font-mono text-xs">{c.name}</span> }, { h: "Image", c: (c) => <Badge>{c.image}</Badge> }, { h: "Status", c: (c) => <StatusBadge status={c.status} /> }, { h: "Uptime", c: (c) => c.uptime }]} /></Panel>
      </div>
    </div>
  );
}
