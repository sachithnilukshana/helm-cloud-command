import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/helm/meta";
import { PageHeader, Panel } from "@/components/helm/ui";

export const Route = createFileRoute("/servers/$id")({
  head: pageHead("Server details", "Server details in HELM."),
  component: Page,
});

function Page() {
  return (
    <div>
      <PageHeader title="Server details" description="This section is being built." />
      <Panel><p className="text-sm text-muted-foreground">Coming soon. <Link to="/" className="text-primary hover:underline">Back to overview</Link></p></Panel>
    </div>
  );
}
