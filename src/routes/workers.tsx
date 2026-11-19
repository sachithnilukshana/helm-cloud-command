import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/helm/api";
import { pageHead } from "@/lib/helm/meta";
import { PageHeader, StatusBadge } from "@/components/helm/ui";

export const Route = createFileRoute("/workers")({
  head: pageHead("Workers", "Background job workers and their queues."),
  loader: ({ context }) => context.queryClient.ensureQueryData(api.workers),
  component: Workers,
});

function Workers() {
  const { data } = useSuspenseQuery(api.workers);
  return (
    <div>
      <PageHeader title="Workers" description="Queue consumers processing background jobs." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data.map((w) => (
          <div key={w.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between"><span className="font-mono text-sm font-medium">{w.name}</span><StatusBadge status={w.status} /></div>
            <p className="mt-1 text-xs text-muted-foreground">queue <span className="font-mono">{w.queue}</span> · {w.server} · ×{w.concurrency}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-md bg-muted p-2"><p className="text-lg font-semibold tabular-nums">{w.processed.toLocaleString()}</p><p className="text-[11px] text-muted-foreground">processed</p></div>
              <div className="rounded-md bg-muted p-2"><p className="text-lg font-semibold tabular-nums text-destructive">{w.failed}</p><p className="text-[11px] text-muted-foreground">failed</p></div>
            </div>
            <div className="mt-3 flex gap-2"><Button size="sm" variant="outline" onClick={() => toast.success(`${w.name} restarted`)}>Restart</Button><Button size="sm" variant="ghost" onClick={() => toast.success(`Retrying ${w.failed} failed jobs`)}>Retry failed</Button></div>
          </div>
        ))}
      </div>
    </div>
  );
}
