import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, Eraser, GitCommit, Loader2, Play, RotateCcw, Rocket, X, Circle, ArrowDownToLine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/helm/api";
import { pageHead } from "@/lib/helm/meta";
import type { Deployment, LogLine, PipelineStep } from "@/lib/helm/types";
import { Confirm, EmptyState, PageHeader, Panel, StatusBadge, TableWrap, td, th, timeAgo } from "@/components/helm/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/deployments")({
  head: pageHead("Deployments", "Pipeline, build logs, queue and history for every HELM deployment."),
  validateSearch: (s: Record<string, unknown>): { deploy?: boolean } => (s.deploy ? { deploy: true } : {}),
  loader: ({ context: { queryClient: q } }) => Promise.all([q.ensureQueryData(api.deployments), q.ensureQueryData(api.projects)]),
  component: Deployments,
});

const stepLogs: Record<string, [LogLine["level"], string][]> = {
  BUILD: [["info", "Compiled 214 modules in 18.2s"], ["info", "Output: dist/ (4.1 MB)"]],
  TEST: [["info", "Running 142 tests"], ["info", "✓ 142 passed (9.4s)"]],
  DEPLOY: [["info", "Pushing image ledger-api:a3f9c21"], ["info", "Starting container on fra-prod-01"]],
  "HEALTH CHECK": [["debug", "GET /health → 200 (38ms)"], ["info", "3/3 health checks passed"]],
  LIVE: [["info", "Traffic switched to a3f9c21 — deployment is live"]],
};

function Deployments() {
  const { data } = useSuspenseQuery(api.deployments);
  const { data: projects } = useSuspenseQuery(api.projects);
  const search = Route.useSearch();
  const [history, setHistory] = useState<Deployment[]>(data.history);
  const [queue, setQueue] = useState<Deployment[]>(data.queue);
  const [steps, setSteps] = useState<PipelineStep[]>(data.pipeline);
  const [logs, setLogs] = useState<LogLine[]>(data.logs);
  const [auto, setAuto] = useState(true);
  const [newOpen, setNewOpen] = useState(!!search.deploy);
  const [proj, setProj] = useState(projects[0].name);
  const current = history.find((d) => d.status === "building");
  const box = useRef<HTMLDivElement>(null);

  // Demo simulation of pipeline progress.
  useEffect(() => {
    if (!current) return;
    const id = setInterval(() => {
      setSteps((prev) => {
        const i = prev.findIndex((s) => s.status === "running");
        if (i === -1) return prev;
        const next = prev.map((s, j) => j === i ? { ...s, status: "completed" as const, sec: s.sec || 8 } : j === i + 1 ? { ...s, status: "running" as const } : s);
        const nextStep = prev[i + 1]?.name;
        if (nextStep) setLogs((l) => [...l, ...(stepLogs[nextStep] ?? []).map(([level, msg], k) => ({ id: l.length + k, ts: new Date().toISOString(), level, msg }))]);
        if (i === prev.length - 2) setTimeout(() => { setHistory((h) => h.map((d) => d.id === current.id ? { ...d, status: "live", durationSec: 128 } : d)); next[prev.length - 1].status = "completed"; toast.success(`${current.project} is live`); }, 1500);
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [current?.id]);

  useEffect(() => { if (auto && box.current) box.current.scrollTop = box.current.scrollHeight; }, [logs, auto]);

  const logText = () => logs.map((l) => `${l.ts} [${l.level.toUpperCase()}] ${l.msg}`).join("\n");
  const start = (project: string) => {
    const d: Deployment = { id: `d-${Math.random().toString(16).slice(2, 6)}`, project, commit: Math.random().toString(16).slice(2, 9), message: "Manual deployment", branch: "main", author: "sachith", status: "building", durationSec: 0, createdAt: new Date().toISOString(), url: projects.find((p) => p.name === project)?.url ?? "" };
    setHistory((h) => [d, ...h.map((x) => x.status === "building" ? { ...x, status: "cancelled" as const } : x)]);
    setSteps(data.pipeline.map((s, i) => ({ ...s, status: i === 0 ? "running" : "waiting", sec: 0 })));
    setLogs([{ id: 0, ts: new Date().toISOString(), level: "info", msg: `Starting deployment of ${project}@${d.commit}` }]);
    toast.success(`Deploying ${project}`);
  };
  const cancel = () => {
    if (!current) return;
    setHistory((h) => h.map((d) => d.id === current.id ? { ...d, status: "cancelled" } : d));
    setSteps((s) => s.map((x) => x.status === "running" ? { ...x, status: "failed" } : x));
    setLogs((l) => [...l, { id: l.length, ts: new Date().toISOString(), level: "error", msg: "Deployment cancelled by sachith" }]);
    toast("Deployment cancelled");
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Deployments" description="Build pipeline, live logs and release history."
        actions={<><Confirm trigger={<Button variant="outline" disabled={!current}><X />Cancel</Button>} title="Cancel the running deployment?" description="The current build stops and production keeps serving the previous release." confirmLabel="Cancel deployment" destructive onConfirm={cancel} /><Button className="glow" onClick={() => setNewOpen(true)}><Rocket />New deployment</Button></>} />

      <Panel title={current ? <span className="flex items-center gap-2">Current deployment <span className="font-mono text-xs text-primary">{current.project}@{current.commit}</span></span> : "Current deployment"} action={current && <StatusBadge status="building" />}>
        {!current && <p className="mb-3 text-sm text-muted-foreground">No build is running. Last pipeline shown below.</p>}
        <ol className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          {steps.map((s, i) => (
            <li key={s.name} className="flex shrink-0 items-center gap-2">
              <div className={cn("flex min-w-[110px] flex-col items-center gap-1.5 rounded-md border px-3 py-2.5", s.status === "running" && "border-primary/50 bg-primary/5 glow", s.status === "completed" && "border-success/30", s.status === "failed" && "border-destructive/40 bg-destructive/5")}>
                <StepIcon status={s.status} />
                <span className="text-[11px] font-medium tracking-wider">{s.name}</span>
                <span className="text-[10px] capitalize text-muted-foreground">{s.status}{s.sec ? ` · ${s.sec}s` : ""}</span>
              </div>
              {i < steps.length - 1 && <span className={cn("h-px w-4", s.status === "completed" ? "bg-success/60" : "bg-border")} />}
            </li>
          ))}
        </ol>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Build console" bodyClass="p-0" action={
          <div className="flex items-center gap-1">
            <button onClick={() => setAuto((a) => !a)} className={cn("rounded p-1.5 text-muted-foreground hover:text-foreground", auto && "text-primary")} aria-label="Toggle auto-scroll" title="Auto-scroll"><ArrowDownToLine className="size-3.5" /></button>
            <button onClick={() => { navigator.clipboard.writeText(logText()); toast.success("Logs copied"); }} className="rounded p-1.5 text-muted-foreground hover:text-foreground" aria-label="Copy logs"><Copy className="size-3.5" /></button>
            <button onClick={() => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([logText()], { type: "text/plain" })); a.download = "build.log"; a.click(); }} className="rounded p-1.5 text-muted-foreground hover:text-foreground" aria-label="Download logs"><Download className="size-3.5" /></button>
            <button onClick={() => setLogs([])} className="rounded p-1.5 text-muted-foreground hover:text-foreground" aria-label="Clear view"><Eraser className="size-3.5" /></button>
          </div>}>
          <div ref={box} className="h-80 overflow-y-auto scrollbar-thin bg-background/60 p-3 font-mono text-xs leading-relaxed">
            {logs.length === 0 ? <p className="text-muted-foreground">View cleared. New output will appear here.</p> : logs.map((l) => (
              <div key={l.id} className="flex gap-3"><span className="shrink-0 text-muted-foreground/70">{new Date(l.ts).toLocaleTimeString()}</span>
                <span className={cn("w-12 shrink-0 uppercase", l.level === "error" ? "text-destructive" : l.level === "warn" ? "text-warning" : l.level === "debug" ? "text-muted-foreground" : "text-success")}>{l.level}</span>
                <span className="break-all">{l.msg}</span></div>
            ))}
            {current && <span className="inline-block h-3.5 w-1.5 animate-pulse bg-primary align-middle" />}
          </div>
        </Panel>
        <Panel title={`Queue · ${queue.length}`}>
          {queue.length === 0 ? <EmptyState title="Queue is empty" /> : <ul className="space-y-2">{queue.map((d, i) => (
            <li key={d.id} className="rounded-md border p-3"><div className="flex items-center justify-between"><span className="text-sm font-medium">{d.project}</span><span className="text-xs text-muted-foreground">#{i + 1}</span></div>
              <p className="mt-1 truncate text-xs text-muted-foreground"><span className="font-mono text-primary">{d.commit}</span> {d.message}</p>
              <div className="mt-2 flex gap-1.5"><Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setQueue((q) => q.filter((x) => x.id !== d.id)); start(d.project); }}><Play />Run now</Button><Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setQueue((q) => q.filter((x) => x.id !== d.id)); toast("Removed from queue"); }}>Remove</Button></div></li>
          ))}</ul>}
        </Panel>
      </div>

      <Panel title="Deployment history">
        <TableWrap>
          <thead><tr>{["Deployment", "Project", "Commit", "Status", "Duration", "URL", "When", ""].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
          <tbody>{history.map((d) => (
            <tr key={d.id}>
              <td className={td + " font-mono text-xs"}>{d.id}</td><td className={td}>{d.project}</td>
              <td className={td}><span className="flex items-center gap-1.5"><GitCommit className="size-3.5 text-muted-foreground" /><span className="font-mono text-xs text-primary">{d.commit}</span><span className="max-w-[200px] truncate text-muted-foreground">{d.message}</span></span></td>
              <td className={td}><StatusBadge status={d.status} /></td><td className={td + " tabular-nums"}>{d.durationSec ? `${Math.floor(d.durationSec / 60)}m ${d.durationSec % 60}s` : "—"}</td>
              <td className={td}><a href={`https://${d.url}`} target="_blank" rel="noreferrer" className="font-mono text-xs text-muted-foreground hover:text-primary">{d.url}</a></td>
              <td className={td + " text-muted-foreground"}>{timeAgo(d.createdAt)}</td>
              <td className={td + " text-right"}><div className="flex justify-end gap-1">
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => start(d.project)}><RotateCcw />Redeploy</Button>
                {d.status === "superseded" && <Confirm trigger={<Button size="sm" variant="outline" className="h-7 text-xs">Rollback</Button>} title={`Roll back ${d.project}?`} description={`Production traffic will be switched to ${d.commit}.`} confirmLabel="Roll back" onConfirm={() => { setHistory((h) => h.map((x) => x.project === d.project && x.status === "live" ? { ...x, status: "superseded" } : x.id === d.id ? { ...x, status: "live" } : x)); toast.success(`Rolled back to ${d.commit}`); }} />}
              </div></td>
            </tr>
          ))}</tbody>
        </TableWrap>
      </Panel>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent><DialogHeader><DialogTitle>New deployment</DialogTitle><DialogDescription>Deploy the latest commit of a project.</DialogDescription></DialogHeader>
          <div className="grid gap-1.5"><Label>Project</Label><Select value={proj} onValueChange={setProj}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent></Select></div>
          <DialogFooter><Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button><Button onClick={() => { start(proj); setNewOpen(false); }}><Rocket />Deploy</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StepIcon({ status }: { status: PipelineStep["status"] }) {
  if (status === "completed") return <span className="grid size-6 place-items-center rounded-full bg-success/15 text-success"><Check className="size-3.5" /></span>;
  if (status === "running") return <span className="grid size-6 place-items-center rounded-full bg-primary/15 text-primary"><Loader2 className="size-3.5 animate-spin" /></span>;
  if (status === "failed") return <span className="grid size-6 place-items-center rounded-full bg-destructive/15 text-destructive"><X className="size-3.5" /></span>;
  return <span className="grid size-6 place-items-center rounded-full bg-muted text-muted-foreground"><Circle className="size-3" /></span>;
}
