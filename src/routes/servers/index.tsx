import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/helm/meta";
import { PageHeader, Panel } from "@/components/helm/ui";

export const Route = createFileRoute("/servers/")({
  head: pageHead("Servers", "Servers in HELM."),
  component: Page,
});

function Page() {
  return (
    <div>
      <PageHeader title="Servers" description="This section is being built." />
      <Panel><p className="text-sm text-muted-foreground">Coming soon. <Link to="/" className="text-primary hover:underline">Back to overview</Link></p></Panel>
    </div>
  );
}
