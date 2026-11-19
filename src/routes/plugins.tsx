import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Puzzle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/helm/api";
import { pageHead } from "@/lib/helm/meta";
import { Badge, PageHeader } from "@/components/helm/ui";

export const Route = createFileRoute("/plugins")({
  head: pageHead("Plugins", "Extend HELM with integrations and tools."),
  loader: ({ context }) => context.queryClient.ensureQueryData(api.plugins),
  component: Plugins,
});

function Plugins() {
  const { data } = useSuspenseQuery(api.plugins);
  const [items, setItems] = useState(data);
  const toggle = (id: string) => setItems((l) => l.map((p) => { if (p.id !== id) return p; toast.success(`${p.name} ${p.installed ? "removed" : "installed"}`); return { ...p, installed: !p.installed }; }));
  return (
    <div>
      <PageHeader title="Plugins" description={`${items.filter((p) => p.installed).length} installed`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((p) => (
          <div key={p.id} className="flex flex-col rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary"><Puzzle className="size-4" /></span><div><p className="text-sm font-medium">{p.name}</p><p className="text-[11px] text-muted-foreground">{p.developer} · v{p.version}</p></div>{p.installed && <span className="ml-auto"><Badge variant="success">installed</Badge></span>}</div>
            <p className="mt-3 flex-1 text-sm text-muted-foreground">{p.description}</p>
            <Button className="mt-4" size="sm" variant={p.installed ? "outline" : "default"} onClick={() => toggle(p.id)}>{p.installed ? "Uninstall" : "Install"}</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
