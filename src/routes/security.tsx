import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/helm/api";
import { pageHead } from "@/lib/helm/meta";
import { Badge, Confirm, Masked, PageHeader, Panel, StatusBadge, timeAgo } from "@/components/helm/ui";
import { DataTable } from "@/components/helm/table";

export const Route = createFileRoute("/security")({
  head: pageHead("Security", "Sessions, firewall, audit log, vulnerabilities and secrets."),
  loader: ({ context }) => context.queryClient.ensureQueryData(api.security),
  component: Security,
});

function Security() {
  const { data } = useSuspenseQuery(api.security);
  const [sessions, setSessions] = useState(data.sessions);
  return (
    <div>
      <PageHeader title="Security" description="Access, network rules and risk." />
      <Tabs defaultValue="sessions">
        <TabsList className="mb-4 flex-wrap h-auto"><TabsTrigger value="sessions">Sessions</TabsTrigger><TabsTrigger value="firewall">Firewall</TabsTrigger><TabsTrigger value="vulns">Vulnerabilities</TabsTrigger><TabsTrigger value="secrets">Secrets</TabsTrigger><TabsTrigger value="audit">Audit log</TabsTrigger></TabsList>
        <TabsContent value="sessions" className="space-y-4">
          <Panel title="Active sessions"><DataTable rows={sessions} cols={[
            { h: "Device", c: (s) => <span>{s.device} {s.current && <Badge variant="gold">this device</Badge>}</span> }, { h: "IP", c: (s) => <span className="font-mono text-xs">{s.ip}</span> }, { h: "Location", c: (s) => s.location }, { h: "Active", c: (s) => timeAgo(s.lastActive) },
            { h: "", c: (s) => !s.current && <Confirm trigger={<Button size="sm" variant="ghost">Sign out</Button>} title="End this session?" description={`${s.device} will be signed out.`} confirmLabel="Sign out" onConfirm={() => { setSessions((l) => l.filter((x) => x.id !== s.id)); toast.success("Session ended"); }} /> },
          ]} /></Panel>
          <Panel title="Recent logins"><DataTable rows={data.logins} cols={[{ h: "User", c: (l) => l.user }, { h: "IP", c: (l) => <span className="font-mono text-xs">{l.ip}</span> }, { h: "Location", c: (l) => l.location }, { h: "Result", c: (l) => <StatusBadge status={l.ok ? "success" : "failed"} /> }, { h: "When", c: (l) => timeAgo(l.at) }]} /></Panel>
        </TabsContent>
        <TabsContent value="firewall"><Panel title="Firewall rules"><DataTable rows={data.firewall} cols={[{ h: "Action", c: (r) => <StatusBadge status={r.action} /> }, { h: "Port", c: (r) => <span className="font-mono text-xs">{r.port}</span> }, { h: "Protocol", c: (r) => r.protocol }, { h: "Source", c: (r) => <span className="font-mono text-xs">{r.source}</span> }, { h: "Note", c: (r) => <span className="text-muted-foreground">{r.note}</span> }]} /></Panel></TabsContent>
        <TabsContent value="vulns"><Panel title="Vulnerabilities"><DataTable rows={data.vulns} cols={[{ h: "Severity", c: (v) => <StatusBadge status={v.severity} /> }, { h: "Package", c: (v) => <span className="font-mono text-xs">{v.pkg}</span> }, { h: "CVE", c: (v) => v.cve }, { h: "Server", c: (v) => v.server }, { h: "Fix", c: (v) => <Badge variant="success">{v.fix}</Badge> }, { h: "", c: (v) => <Button size="sm" variant="ghost" onClick={() => toast.success(`Patching ${v.pkg}`)}>Patch</Button> }]} /></Panel></TabsContent>
        <TabsContent value="secrets"><Panel title="Environment secrets"><DataTable rows={data.secrets} cols={[{ h: "Key", c: (s) => <span className="font-mono text-xs">{s.key}</span> }, { h: "Value", c: (s) => <Masked value={s.value} /> }, { h: "Project", c: (s) => s.project }, { h: "Updated", c: (s) => timeAgo(s.updated) }]} /></Panel></TabsContent>
        <TabsContent value="audit"><Panel title="Audit log"><DataTable rows={data.audit} cols={[{ h: "Actor", c: (a) => a.actor }, { h: "Action", c: (a) => <span className="font-mono text-xs">{a.action}</span> }, { h: "Target", c: (a) => a.target }, { h: "When", c: (a) => timeAgo(a.at) }]} /></Panel></TabsContent>
      </Tabs>
    </div>
  );
}
