import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/helm/api";
import { pageHead } from "@/lib/helm/meta";
import { Meter, PageHeader, SearchInput, StatusBadge } from "@/components/helm/ui";

export const Route = createFileRoute("/servers/")({
  head: pageHead("Servers", "VPS fleet with live CPU, memory and disk usage."),
  loader: ({ context }) => context.queryClient.ensureQueryData(api.servers),
  component: Servers,
});

function Servers() {
  const { data } = useSuspenseQuery(api.servers);
  const [q, setQ] = useState("");
  const list = data.filter((s) => (s.name + s.ip + s.region).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="Servers" description={`${data.length} machines across ${new Set(data.map((s) => s.region)).size} regions`}
        actions={<><SearchInput value={q} onChange={setQ} placeholder="Search servers…" /><Button onClick={() => toast.success("Provisioning request queued")}><Plus className="size-4" />New server</Button></>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((s) => (
          <Link key={s.id} to="/servers/$id" params={{ id: s.id }} className="rounded-lg border bg-card p-4 transition-colors hover:border-primary/40">
            <div className="flex items-center justify-between"><span className="font-mono text-sm font-medium">{s.name}</span><StatusBadge status={s.status} /></div>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{s.ip} · {s.region} · {s.os}</p>
            <div className="mt-4 space-y-2.5 text-xs">
              {([["CPU", s.cpu], ["RAM", s.ram], ["Disk", s.disk]] as const).map(([l, v]) => (
                <div key={l}><div className="mb-1 flex justify-between text-muted-foreground"><span>{l}</span><span className="tabular-nums">{v}%</span></div><Meter value={v} /></div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground">{s.cores} vCPU · {s.ramGb} GB RAM · {s.storageGb} GB · up {s.uptimeDays}d</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
