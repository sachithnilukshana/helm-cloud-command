import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/helm/api";
import { pageHead } from "@/lib/helm/meta";
import { Badge, Confirm, Masked, PageHeader, Panel, timeAgo } from "@/components/helm/ui";
import { DataTable } from "@/components/helm/table";

export const Route = createFileRoute("/api-manager")({
  head: pageHead("API Manager", "API keys, scopes and endpoint performance."),
  loader: ({ context }) => context.queryClient.ensureQueryData(api.apiManager),
  component: ApiManager,
});

const methodTone = { GET: "success", POST: "gold", PUT: "warning", DELETE: "error" } as const;

function ApiManager() {
  const { data } = useSuspenseQuery(api.apiManager);
  const [keys, setKeys] = useState(data.keys);
  return (
    <div className="space-y-4">
      <PageHeader title="API Manager" description="Credentials and endpoint health." actions={<Button onClick={() => { setKeys((k) => [{ id: `k${Date.now()}`, name: "New key", prefix: "helm_live", secret: `helm_live_${Math.random().toString(36).slice(2, 18)}`, scopes: ["read"], created: new Date().toISOString(), lastUsed: new Date().toISOString() }, ...k]); toast.success("API key created"); }}><Plus className="size-4" />New key</Button>} />
      <Panel title="API keys">
        <DataTable rows={keys} cols={[
          { h: "Name", c: (k) => k.name }, { h: "Secret", c: (k) => <Masked value={k.secret} /> }, { h: "Scopes", c: (k) => <span className="flex flex-wrap gap-1">{k.scopes.map((s) => <Badge key={s}>{s}</Badge>)}</span> },
          { h: "Last used", c: (k) => timeAgo(k.lastUsed) },
          { h: "", c: (k) => <Confirm trigger={<Button size="sm" variant="ghost">Revoke</Button>} destructive title={`Revoke ${k.name}?`} description="Apps using this key will stop working immediately." confirmLabel="Revoke" onConfirm={() => setKeys((l) => l.filter((x) => x.id !== k.id))} /> },
        ]} />
      </Panel>
      <Panel title="Endpoints">
        <DataTable rows={data.endpoints} cols={[
          { h: "Method", c: (e) => <Badge variant={methodTone[e.method]}>{e.method}</Badge> }, { h: "Path", c: (e) => <span className="font-mono text-xs">{e.path}</span> }, { h: "Project", c: (e) => e.project },
          { h: "Req/min", c: (e) => e.rpm.toLocaleString() }, { h: "p95", c: (e) => `${e.p95} ms` }, { h: "Errors", c: (e) => <span className={e.errorRate > 1 ? "text-destructive" : ""}>{e.errorRate}%</span> },
        ]} />
      </Panel>
    </div>
  );
}
