import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/helm/api";
import { pageHead } from "@/lib/helm/meta";
import { Badge, Confirm, PageHeader, Panel, StatusBadge, timeAgo } from "@/components/helm/ui";
import { DataTable } from "@/components/helm/table";

export const Route = createFileRoute("/backups")({
  head: pageHead("Backups", "Database and project snapshots with scheduled retention."),
  loader: ({ context }) => context.queryClient.ensureQueryData(api.backups),
  component: Backups,
});

function Backups() {
  const { data } = useSuspenseQuery(api.backups);
  const [sched, setSched] = useState(data.schedules);
  return (
    <div className="space-y-4">
      <PageHeader title="Backups" description="Snapshots and schedules." actions={<Button onClick={() => toast.success("Backup started")}><Plus className="size-4" />Back up now</Button>} />
      <Panel title="Schedules">
        <DataTable rows={sched} cols={[
          { h: "Name", c: (s) => s.name }, { h: "Schedule", c: (s) => <Badge>{s.cron}</Badge> }, { h: "Target", c: (s) => <span className="font-mono text-xs">{s.target}</span> },
          { h: "Keep", c: (s) => `${s.retention} copies` },
          { h: "Enabled", c: (s) => <Switch checked={s.enabled} onCheckedChange={(v) => setSched((l) => l.map((x) => x.id === s.id ? { ...x, enabled: v } : x))} aria-label={`Toggle ${s.name}`} /> },
        ]} />
      </Panel>
      <Panel title="History">
        <DataTable rows={data.backups} cols={[
          { h: "Target", c: (b) => <span className="font-mono text-xs">{b.target}</span> }, { h: "Type", c: (b) => <span className="capitalize">{b.kind}</span> },
          { h: "Size", c: (b) => `${b.sizeGb} GB` }, { h: "Status", c: (b) => <StatusBadge status={b.status} /> }, { h: "When", c: (b) => timeAgo(b.at) }, { h: "Location", c: (b) => <span className="text-xs text-muted-foreground">{b.location}</span> },
          { h: "", c: (b) => b.status === "completed" && <Confirm trigger={<Button size="sm" variant="ghost">Restore</Button>} title={`Restore ${b.target}?`} description="Current data will be replaced with this snapshot." confirmLabel="Restore" destructive onConfirm={() => toast.success(`Restoring ${b.target}`)} /> },
        ]} />
      </Panel>
    </div>
  );
}
