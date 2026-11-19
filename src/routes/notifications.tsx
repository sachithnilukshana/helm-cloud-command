import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/helm/api";
import { pageHead } from "@/lib/helm/meta";
import { EmptyState, PageHeader, Panel, StatusBadge, timeAgo } from "@/components/helm/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: pageHead("Notifications", "Alerts about deployments, servers and databases."),
  loader: ({ context }) => context.queryClient.ensureQueryData(api.notifications),
  component: Notifications,
});

const cats = ["all", "deployment", "server", "database"] as const;

function Notifications() {
  const { data } = useSuspenseQuery(api.notifications);
  const [items, setItems] = useState(data);
  const [cat, setCat] = useState<(typeof cats)[number]>("all");
  const list = items.filter((n) => cat === "all" || n.category === cat);
  return (
    <div>
      <PageHeader title="Notifications" description={`${items.filter((n) => !n.read).length} unread`} actions={<Button variant="outline" onClick={() => setItems((l) => l.map((n) => ({ ...n, read: true })))}>Mark all read</Button>} />
      <div className="mb-4 flex flex-wrap gap-2">{cats.map((c) => <button key={c} onClick={() => setCat(c)} className={cn("rounded-full border px-3 py-1 text-xs capitalize", cat === c ? "border-primary/50 bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>{c}</button>)}</div>
      <Panel bodyClass="p-0">
        {list.length === 0 ? <EmptyState title="No notifications" /> : <ul>{list.map((n) => (
          <li key={n.id} className={cn("flex gap-3 border-b px-4 py-3 last:border-0", !n.read && "bg-primary/5")}>
            <StatusBadge status={n.level} className="h-fit" />
            <div className="min-w-0 flex-1"><p className="text-sm font-medium">{n.title}</p><p className="text-xs text-muted-foreground">{n.body}</p></div>
            <div className="text-right"><p className="text-[11px] text-muted-foreground">{timeAgo(n.at)}</p>
              {!n.read && <button onClick={() => setItems((l) => l.map((x) => x.id === n.id ? { ...x, read: true } : x))} className="text-[11px] text-primary hover:underline">Mark read</button>}</div>
          </li>
        ))}</ul>}
      </Panel>
    </div>
  );
}
