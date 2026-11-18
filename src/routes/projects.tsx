import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ExternalLink, Github, LayoutGrid, List, Plus, UploadCloud, FileArchive, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/helm/api";
import { pageHead } from "@/lib/helm/meta";
import type { Project } from "@/lib/helm/types";
import { Badge, EmptyState, PageHeader, SearchInput, StatusBadge, TableWrap, td, th, timeAgo } from "@/components/helm/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects")({
  head: pageHead("Projects", "Manage applications, frameworks and live URLs deployed with HELM."),
  validateSearch: (s: Record<string, unknown>): { q?: string } => (typeof s["q"] === "string" ? { q: s["q"] as string } : {}),
  loader: ({ context }) => context.queryClient.ensureQueryData(api.projects),
  component: Projects,
});

const statuses = ["all", "live", "building", "failed", "paused"] as const;

function Projects() {
  const { data } = useSuspenseQuery(api.projects);
  const { q: initial } = Route.useSearch();
  const [items, setItems] = useState(data);
  const [q, setQ] = useState(initial ?? "");
  const [status, setStatus] = useState<(typeof statuses)[number]>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<"recent" | "name">("recent");
  const [open, setOpen] = useState(false);

  const list = useMemo(() => items
    .filter((p) => (status === "all" || p.status === status) && (p.name + p.framework + p.url).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : +new Date(b.lastDeploy) - +new Date(a.lastDeploy)), [items, q, status, sort]);

  return (
    <div>
      <PageHeader title="Projects" description={`${items.length} applications across ${new Set(items.map((p) => p.serverId)).size} servers`}
        actions={<Button onClick={() => setOpen(true)} className="glow"><Plus />Create project</Button>} />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput value={q} onChange={setQ} placeholder="Search projects…" />
        <div className="flex flex-wrap gap-1">
          {statuses.map((s) => <button key={s} onClick={() => setStatus(s)} className={cn("rounded-md border px-2.5 py-1 text-xs capitalize", status === s ? "border-primary/50 bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>{s}</button>)}
        </div>
        <div className="flex items-center gap-2 lg:ml-auto">
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}><SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="recent">Last deployed</SelectItem><SelectItem value="name">Name A–Z</SelectItem></SelectContent></Select>
          <div className="flex rounded-md border p-0.5">
            <button aria-label="Grid view" onClick={() => setView("grid")} className={cn("rounded p-1.5", view === "grid" && "bg-accent text-primary")}><LayoutGrid className="size-3.5" /></button>
            <button aria-label="List view" onClick={() => setView("list")} className={cn("rounded p-1.5", view === "list" && "bg-accent text-primary")}><List className="size-3.5" /></button>
          </div>
        </div>
      </div>

      {list.length === 0 ? <div className="rounded-lg border bg-card"><EmptyState title="No projects match" description="Try a different search or filter." action={<Button size="sm" variant="outline" onClick={() => { setQ(""); setStatus("all"); }}>Reset filters</Button>} /></div>
      : view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{list.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
      ) : (
        <div className="rounded-lg border bg-card p-4"><TableWrap>
          <thead><tr>{["Name", "Framework", "Status", "Frontend", "Backend", "URL", "Last deploy"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
          <tbody>{list.map((p) => <tr key={p.id}><td className={td + " font-medium"}>{p.name}</td><td className={td}><Badge>{p.framework}</Badge></td><td className={td}><StatusBadge status={p.status} /></td><td className={td}><StatusBadge status={p.frontend} /></td><td className={td}><StatusBadge status={p.backend} /></td><td className={td}><a className="font-mono text-xs text-muted-foreground hover:text-primary" href={`https://${p.url}`} target="_blank" rel="noreferrer">{p.url}</a></td><td className={td + " text-muted-foreground"}>{timeAgo(p.lastDeploy)}</td></tr>)}</tbody>
        </TableWrap></div>
      )}
      <CreateProjectDialog open={open} onOpenChange={setOpen} onCreate={(p) => { setItems((x) => [p, ...x]); toast.success(`Project ${p.name} created`, { description: "First deployment queued." }); }} />
    </div>
  );
}

function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="group rounded-lg border bg-card p-4 transition-all hover:border-primary/40 hover:glow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0"><h3 className="truncate font-medium">{p.name}</h3><p className="truncate font-mono text-xs text-muted-foreground">{p.repo}</p></div>
        <StatusBadge status={p.status} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5"><Badge variant="gold">{p.framework}</Badge><Badge>{p.branch}</Badge></div>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md bg-muted/50 p-2"><dt className="text-muted-foreground">Frontend</dt><dd className="mt-1"><StatusBadge status={p.frontend} /></dd></div>
        <div className="rounded-md bg-muted/50 p-2"><dt className="text-muted-foreground">Backend</dt><dd className="mt-1"><StatusBadge status={p.backend} /></dd></div>
      </dl>
      <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs">
        <a href={`https://${p.url}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-mono text-muted-foreground hover:text-primary">{p.url}<ExternalLink className="size-3" /></a>
        <span className="text-muted-foreground">{timeAgo(p.lastDeploy)}</span>
      </div>
    </article>
  );
}

const detect = (name: string) => /next/i.test(name) ? "Next.js" : /api|nest/i.test(name) ? "NestJS" : /vite|dash/i.test(name) ? "Vite" : /astro|site/i.test(name) ? "Astro" : "Node.js";

function CreateProjectDialog({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (o: boolean) => void; onCreate: (p: Project) => void }) {
  const [source, setSource] = useState("github");
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("main");
  const [name, setName] = useState("");
  const [fe, setFe] = useState("./");
  const [be, setBe] = useState("./server");
  const [env, setEnv] = useState("NODE_ENV=production\n");
  const framework = detect(name + repo + (file?.name ?? ""));
  const valid = name.trim().length > 1 && (source === "zip" ? !!file : /^(https?:\/\/)?(www\.)?github\.com\/.+\/.+/.test(repo));

  const submit = () => {
    onCreate({ id: crypto.randomUUID(), name: name.trim(), framework, repo: source === "zip" ? `upload:${file?.name}` : repo.replace(/^https?:\/\//, ""), branch, url: `${name.trim()}.helm.run`, status: "building", frontend: "none", backend: "none", lastDeploy: new Date().toISOString(), serverId: "fra-01" });
    onOpenChange(false); setName(""); setRepo(""); setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader><DialogTitle>Create project</DialogTitle><DialogDescription>Import from GitHub or upload a ZIP archive.</DialogDescription></DialogHeader>
        <Tabs value={source} onValueChange={setSource}>
          <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="github"><Github className="mr-1.5 size-4" />Connect GitHub</TabsTrigger><TabsTrigger value="zip"><FileArchive className="mr-1.5 size-4" />Upload ZIP</TabsTrigger></TabsList>
          <TabsContent value="github" className="space-y-3 pt-2">
            <div className="grid gap-1.5"><Label htmlFor="repo">Repository URL</Label><Input id="repo" placeholder="https://github.com/org/repo" value={repo} onChange={(e) => { setRepo(e.target.value); if (!name) setName(e.target.value.split("/").pop() ?? ""); }} /></div>
            <div className="grid gap-1.5"><Label>Branch</Label><Select value={branch} onValueChange={setBranch}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["main", "develop", "staging", "release"].map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>
          </TabsContent>
          <TabsContent value="zip" className="pt-2">
            <label onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) { setFile(f); if (!name) setName(f.name.replace(/\.zip$/i, "")); } }}
              className={cn("flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center transition-colors", drag ? "border-primary bg-primary/5" : "hover:border-primary/50")}>
              <UploadCloud className={cn("size-8", drag ? "text-primary" : "text-muted-foreground")} />
              {file ? <><p className="text-sm font-medium">{file.name}</p><p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB · click to replace</p></> : <><p className="text-sm">Drop a .zip here or <span className="text-primary">browse</span></p><p className="text-xs text-muted-foreground">Up to 500 MB</p></>}
              <input type="file" accept=".zip" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); if (!name) setName(f.name.replace(/\.zip$/i, "")); } }} />
            </label>
          </TabsContent>
        </Tabs>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2"><Label htmlFor="pname">Project name</Label><Input id="pname" value={name} onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="my-app" /></div>
          <div className="flex items-center gap-2 rounded-md border border-primary/25 bg-primary/5 px-3 py-2 text-xs sm:col-span-2"><Sparkles className="size-3.5 text-primary" />Detected framework: <span className="font-medium text-primary">{framework}</span></div>
          <div className="grid gap-1.5"><Label htmlFor="fe">Frontend directory</Label><Input id="fe" value={fe} onChange={(e) => setFe(e.target.value)} className="font-mono text-xs" /></div>
          <div className="grid gap-1.5"><Label htmlFor="be">Backend directory</Label><Input id="be" value={be} onChange={(e) => setBe(e.target.value)} className="font-mono text-xs" /></div>
          <div className="grid gap-1.5 sm:col-span-2"><Label htmlFor="env">Environment variables</Label><Textarea id="env" rows={3} value={env} onChange={(e) => setEnv(e.target.value)} className="font-mono text-xs" /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={!valid} onClick={submit}>Create & deploy</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
