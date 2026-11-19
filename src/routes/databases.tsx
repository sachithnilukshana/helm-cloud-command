import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/helm/api";
import { pageHead } from "@/lib/helm/meta";
import { Badge, Confirm, Meter, PageHeader, StatusBadge } from "@/components/helm/ui";

export const Route = createFileRoute("/databases")({
  head: pageHead("Databases", "Managed PostgreSQL, MySQL, MongoDB and Redis instances."),
  loader: ({ context }) => context.queryClient.ensureQueryData(api.databases),
  component: Databases,
});

function Databases() {
  const { data } = useSuspenseQuery(api.databases);
  const [items, setItems] = useState(data);
  const set = (id: string, status: "running" | "stopped" | "restarting") => setItems((l) => l.map((d) => d.id === id ? { ...d, status } : d));
  return (
    <div>
      <PageHeader title="Databases" description={`${items.filter((d) => d.status === "running").length} of ${items.length} running`} actions={<Button onClick={() => toast.success("Database provisioning started")}><Plus className="size-4" />New database</Button>} />
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((d) => (
          <div key={d.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between"><div><p className="font-mono text-sm font-medium">{d.name}</p><p className="text-xs text-muted-foreground">{d.engine} {d.version}</p></div><StatusBadge status={d.status} /></div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div><div className="mb-1 flex justify-between text-muted-foreground"><span>Storage</span><span>{d.usedGb}/{d.sizeGb} GB</span></div><Meter value={(d.usedGb / d.sizeGb) * 100} /></div>
              <div><div className="mb-1 flex justify-between text-muted-foreground"><span>Connections</span><span>{d.connections}/{d.maxConnections}</span></div><Meter value={(d.connections / d.maxConnections) * 100} /></div>
            </div>
            <button onClick={() => { navigator.clipboard?.writeText(`${d.host}:${d.port}`); toast.success("Host copied"); }} className="mt-4 flex items-center gap-2"><Badge>{d.host}:{d.port}</Badge><Copy className="size-3 text-muted-foreground" /></button>
            <div className="mt-4 flex flex-wrap gap-2">
              {d.status === "stopped" ? <Button size="sm" onClick={() => set(d.id, "running")}>Start</Button>
                : <Confirm trigger={<Button size="sm" variant="outline">Stop</Button>} destructive title={`Stop ${d.name}?`} description="Apps using this database will lose their connection." confirmLabel="Stop" onConfirm={() => set(d.id, "stopped")} />}
              <Button size="sm" variant="outline" onClick={() => { set(d.id, "restarting"); setTimeout(() => set(d.id, "running"), 1500); }}>Restart</Button>
              <Button size="sm" variant="ghost" onClick={() => toast.success(`Backup of ${d.name} started`)}>Back up now</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
