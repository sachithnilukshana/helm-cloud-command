import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Play, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/helm/api";
import { pageHead } from "@/lib/helm/meta";
import { Badge, PageHeader, Panel, StatusBadge, timeAgo } from "@/components/helm/ui";
import { DataTable } from "@/components/helm/table";

export const Route = createFileRoute("/cron")({
  head: pageHead("Cron Jobs", "Scheduled commands across your servers."),
  loader: ({ context }) => context.queryClient.ensureQueryData(api.cron),
  component: Cron,
});

function Cron() {
  const { data } = useSuspenseQuery(api.cron);
  const [jobs, setJobs] = useState(data);
  return (
    <div>
      <PageHeader title="Cron Jobs" description="Recurring tasks on a schedule." actions={<Button onClick={() => toast.success("New job created")}><Plus className="size-4" />New job</Button>} />
      <Panel>
        <DataTable rows={jobs} cols={[
          { h: "Name", c: (j) => j.name }, { h: "Schedule", c: (j) => <Badge variant="gold">{j.schedule}</Badge> }, { h: "Command", c: (j) => <span className="font-mono text-xs">{j.command}</span> },
          { h: "Server", c: (j) => <span className="font-mono text-xs">{j.server}</span> }, { h: "Last run", c: (j) => <span className="flex items-center gap-2"><StatusBadge status={j.lastStatus} />{timeAgo(j.lastRun)}</span> },
          { h: "On", c: (j) => <Switch checked={j.enabled} onCheckedChange={(v) => setJobs((l) => l.map((x) => x.id === j.id ? { ...x, enabled: v } : x))} aria-label={`Toggle ${j.name}`} /> },
          { h: "", c: (j) => <Button size="sm" variant="ghost" onClick={() => toast.success(`${j.name} started`)}><Play className="size-3" />Run</Button> },
        ]} />
      </Panel>
    </div>
  );
}
