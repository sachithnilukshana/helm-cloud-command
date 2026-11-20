import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { pageHead } from "@/lib/helm/meta";
import { Confirm, PageHeader, Panel } from "@/components/helm/ui";

export const Route = createFileRoute("/settings")({
  head: pageHead("Settings", "Profile, team and workspace preferences."),
  component: Settings,
});

function Settings() {
  return (
    <div className="max-w-3xl space-y-4">
      <PageHeader title="Settings" description="Account and workspace" />
      <Panel title="Profile">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); toast.success("Profile saved"); }}>
          <div className="space-y-1.5"><Label htmlFor="n">Name</Label><Input id="n" defaultValue="Sachith Dev" /></div>
          <div className="space-y-1.5"><Label htmlFor="e">Email</Label><Input id="e" type="email" defaultValue="sachith@demo.helm.run" /></div>
          <div className="space-y-1.5"><Label htmlFor="w">Workspace</Label><Input id="w" defaultValue="HELM Demo" /></div>
          <div className="space-y-1.5"><Label htmlFor="tz">Timezone</Label><Input id="tz" defaultValue="Asia/Colombo" /></div>
          <div className="sm:col-span-2"><Button type="submit">Save changes</Button></div>
        </form>
      </Panel>
      <Panel title="Preferences">
        {[["Email me when a deployment fails", true], ["Weekly usage report", true], ["Two-factor authentication", true], ["Auto-renew SSL certificates", true]].map(([l, v]) => (
          <div key={String(l)} className="flex items-center justify-between border-b py-3 text-sm last:border-0"><span>{l}</span><Switch defaultChecked={Boolean(v)} aria-label={String(l)} /></div>
        ))}
      </Panel>
      <Panel title="Danger zone" className="border-destructive/40">
        <div className="flex items-center justify-between gap-4"><p className="text-sm text-muted-foreground">Delete this workspace and all its servers, projects and backups.</p>
          <Confirm trigger={<Button variant="destructive">Delete workspace</Button>} destructive title="Delete HELM Demo workspace?" description="This permanently removes everything and cannot be undone." confirmLabel="Delete" onConfirm={() => toast.error("Deletion disabled in demo mode")} /></div>
      </Panel>
    </div>
  );
}
