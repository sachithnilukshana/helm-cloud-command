import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronRight, File, Folder } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/helm/api";
import { pageHead } from "@/lib/helm/meta";
import type { FileNode } from "@/lib/helm/types";
import { EmptyState, PageHeader, Panel, timeAgo } from "@/components/helm/ui";

export const Route = createFileRoute("/files")({
  head: pageHead("File Manager", "Browse and edit files on your servers."),
  loader: ({ context }) => context.queryClient.ensureQueryData(api.files),
  component: Files,
});

function Files() {
  const { data } = useSuspenseQuery(api.files);
  const [path, setPath] = useState<FileNode[]>([data]);
  const [open, setOpen] = useState<FileNode | null>(null);
  const [text, setText] = useState("");
  const dir = path[path.length - 1]!;
  return (
    <div>
      <PageHeader title="File Manager" description="Server filesystem" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <Panel title={<span className="flex flex-wrap items-center gap-1 font-mono text-xs">{path.map((p, i) => <button key={i} onClick={() => setPath(path.slice(0, i + 1))} className="hover:text-primary">{i ? `${p.name}/` : "/"}</button>)}</span>} bodyClass="p-0">
          <ul>{(dir.children ?? []).map((f) => (
            <li key={f.name}><button className="flex w-full items-center gap-2 border-b px-4 py-2 text-left text-sm last:border-0 hover:bg-accent/40"
              onClick={() => f.type === "folder" ? setPath([...path, f]) : (setOpen(f), setText(f.content ?? ""))}>
              {f.type === "folder" ? <Folder className="size-4 text-primary" /> : <File className="size-4 text-muted-foreground" />}
              <span className="font-mono text-xs">{f.name}</span>
              <span className="ml-auto text-[11px] text-muted-foreground">{f.type === "folder" ? <ChevronRight className="size-3" /> : `${((f.size ?? 0) / 1024).toFixed(1)} KB · ${f.modified ? timeAgo(f.modified) : ""}`}</span>
            </button></li>
          ))}</ul>
        </Panel>
        <Panel title={open ? <span className="font-mono text-xs">{open.name}</span> : "Editor"} action={open && <Button size="sm" onClick={() => toast.success(`${open.name} saved`)}>Save</Button>}>
          {open ? <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[50vh] font-mono text-xs" aria-label="File contents" /> : <EmptyState title="Select a file" description="Pick a file on the left to view and edit it." />}
        </Panel>
      </div>
    </div>
  );
}
