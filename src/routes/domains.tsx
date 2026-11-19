import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Lock, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/helm/api";
import { pageHead } from "@/lib/helm/meta";
import { Badge, PageHeader, Panel, StatusBadge } from "@/components/helm/ui";
import { DataTable } from "@/components/helm/table";

export const Route = createFileRoute("/domains")({
  head: pageHead("Domains", "Custom domains, SSL certificates and DNS records."),
  loader: ({ context }) => context.queryClient.ensureQueryData(api.domains),
  component: Domains,
});

function Domains() {
  const { data } = useSuspenseQuery(api.domains);
  const [sel, setSel] = useState(data[0]?.id);
  const d = data.find((x) => x.id === sel);
  return (
    <div className="space-y-4">
      <PageHeader title="Domains" description="Point domains at projects and manage certificates." actions={<Button onClick={() => toast.success("Domain added — add the DNS records to verify")}><Plus className="size-4" />Add domain</Button>} />
      <Panel bodyClass="p-4">
        <DataTable rows={data} cols={[
          { h: "Domain", c: (r) => <button onClick={() => setSel(r.id)} className={r.id === sel ? "font-medium text-primary" : "hover:text-primary"}>{r.name}</button> },
          { h: "Project", c: (r) => <span className="font-mono text-xs">{r.project}</span> },
          { h: "SSL", c: (r) => <StatusBadge status={r.ssl} /> },
          { h: "HTTPS", c: (r) => r.https ? <Lock className="size-4 text-success" /> : "—" },
          { h: "DNS", c: (r) => <StatusBadge status={r.dns} /> },
          { h: "Expires", c: (r) => new Date(r.expires).toLocaleDateString() },
          { h: "", c: (r) => <Button size="sm" variant="ghost" onClick={() => toast.success(`Renewing certificate for ${r.name}`)}>Renew SSL</Button> },
        ]} />
      </Panel>
      {d && <Panel title={`DNS records · ${d.name}`}>
        <DataTable rows={d.records.map((r, i) => ({ ...r, id: i }))} cols={[{ h: "Type", c: (r) => <Badge variant="gold">{r.type}</Badge> }, { h: "Name", c: (r) => <span className="font-mono text-xs">{r.name}</span> }, { h: "Value", c: (r) => <span className="font-mono text-xs">{r.value}</span> }]} />
      </Panel>}
    </div>
  );
}
