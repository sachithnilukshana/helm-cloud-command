import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useActiveServer } from "@/components/helm/shell";
import { pageHead } from "@/lib/helm/meta";
import { PageHeader, Panel } from "@/components/helm/ui";

export const Route = createFileRoute("/terminal")({
  head: pageHead("Terminal", "Browser shell for your servers."),
  component: Terminal,
});

const replies: Record<string, string> = {
  help: "Available: help, ls, pwd, whoami, uptime, df, docker ps, clear",
  ls: "atlas-web  ledger-api  orbit-dashboard  marketing-site",
  pwd: "/srv", whoami: "deploy",
  uptime: " 21:30:02 up 41 days,  3:12,  1 user,  load average: 0.42, 0.38, 0.35",
  df: "Filesystem  Size  Used Avail Use%\n/dev/vda1   160G   77G   83G  48%",
  "docker ps": "CONTAINER ID  IMAGE           STATUS\n3f2a91c       atlas-web:3.4   Up 2 days\n9bc04e1       postgres:16     Up 41 days",
};

function Terminal() {
  const { serverId } = useActiveServer();
  const [lines, setLines] = useState<string[]>([`Connected to ${serverId}. Type "help".`]);
  const [cmd, setCmd] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ block: "nearest" }), [lines]);
  const run = () => {
    const c = cmd.trim(); setCmd("");
    if (c === "clear") return setLines([]);
    setLines((l) => [...l, `deploy@${serverId}:/srv$ ${c}`, ...(c ? [replies[c] ?? `${c}: command not found`] : [])]);
  };
  return (
    <div>
      <PageHeader title="Terminal" description={`Shell on ${serverId} (demo)`} />
      <Panel bodyClass="p-0">
        <div className="h-[60vh] overflow-y-auto scrollbar-thin bg-background p-4 font-mono text-xs leading-relaxed" onClick={() => document.getElementById("term-in")?.focus()}>
          {lines.map((l, i) => <pre key={i} className="whitespace-pre-wrap">{l}</pre>)}
          <div ref={end} className="flex"><span className="text-primary">deploy@{serverId}:/srv$&nbsp;</span>
            <input id="term-in" aria-label="Command" autoFocus value={cmd} onChange={(e) => setCmd(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} className="flex-1 bg-transparent outline-none" /></div>
        </div>
      </Panel>
    </div>
  );
}
