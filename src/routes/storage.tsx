import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/helm/api";
import { pageHead } from "@/lib/helm/meta";
import { Badge, PageHeader, Panel } from "@/components/helm/ui";
import { DataTable } from "@/components/helm/table";

export const Route = createFileRoute("/storage")({
  head: pageHead("Storage", "Object storage buckets and usage."),
  loader: ({ context }) => context.queryClient.ensureQueryData(api.buckets),
  component: Storage,
});

function Storage() {
  const { data } = useSuspenseQuery(api.buckets);
  const total = data.reduce((a, b) => a + b.usedGb, 0);
  return (
    <div>
      <PageHeader title="Storage" description={`${total.toFixed(1)} GB across ${data.length} buckets`} actions={<Button onClick={() => toast.success("Bucket created")}><Plus className="size-4" />New bucket</Button>} />
      <Panel>
        <DataTable rows={data} cols={[
          { h: "Bucket", c: (b) => <span className="font-mono text-xs">{b.name}</span> }, { h: "Region", c: (b) => b.region }, { h: "Objects", c: (b) => b.objects.toLocaleString() },
          { h: "Used", c: (b) => `${b.usedGb} GB` }, { h: "Access", c: (b) => <Badge variant={b.public ? "warning" : "muted"}>{b.public ? "public" : "private"}</Badge> },
        ]} />
      </Panel>
    </div>
  );
}
