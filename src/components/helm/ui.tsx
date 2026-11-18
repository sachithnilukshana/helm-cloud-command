import { type ReactNode, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Inbox, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function timeAgo(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className, bodyClass }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClass?: string }) {
  return (
    <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className={cn("rounded-lg border bg-card", className)}>
      {title && (
        <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <h2 className="text-sm font-medium">{title}</h2>
          {action}
        </header>
      )}
      <div className={cn("p-4", bodyClass)}>{children}</div>
    </motion.section>
  );
}

const tone: Record<string, string> = {
  success: "text-success bg-success/10 border-success/25",
  warning: "text-warning bg-warning/10 border-warning/25",
  error: "text-destructive bg-destructive/10 border-destructive/25",
  gold: "text-primary bg-primary/10 border-primary/25",
  muted: "text-muted-foreground bg-muted border-border",
};
const statusTone: Record<string, keyof typeof tone> = {
  online: "success", live: "success", healthy: "success", running: "success", valid: "success", verified: "success", completed: "success", success: "success", allow: "success", connected: "success",
  degraded: "warning", building: "gold", queued: "muted", expiring: "warning", pending: "warning", restarting: "warning", medium: "warning", warning: "warning", restricted: "warning",
  offline: "error", failed: "error", down: "error", error: "error", deny: "error", high: "error", exited: "error", disconnected: "error",
  stopped: "muted", paused: "muted", none: "muted", superseded: "muted", cancelled: "muted", low: "muted", info: "muted",
};

export function StatusBadge({ status, label, className }: { status: string; label?: string; className?: string }) {
  const t = tone[statusTone[status] ?? "muted"];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize", t, className)}>
      <span className={cn("size-1.5 rounded-full bg-current", (status === "building" || status === "running" || status === "restarting") && "animate-pulse")} />
      {label ?? status}
    </span>
  );
}

export function Badge({ children, variant = "muted" }: { children: ReactNode; variant?: keyof typeof tone }) {
  return <span className={cn("inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[11px]", tone[variant])}>{children}</span>;
}

export function Meter({ value, className }: { value: number; className?: string }) {
  const color = value > 85 ? "bg-destructive" : value > 70 ? "bg-warning" : "bg-primary";
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <motion.div className={cn("h-full rounded-full", color)} initial={{ width: 0 }} animate={{ width: `${Math.min(100, value)}%` }} transition={{ duration: 0.6 }} />
    </div>
  );
}

export function Sparkline({ data, color = "var(--primary)" }: { data: number[]; color?: string }) {
  const id = `sp${Math.abs(data.reduce((a, b) => a + b, 0) | 0)}`;
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer>
        <AreaChart data={data.map((v, i) => ({ i, v }))} margin={{ top: 2, bottom: 0, left: 0, right: 0 }}>
          <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.35} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${id})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatCard({ label, value, unit, trend, icon: Icon, spark, progress }: { label: string; value: string | number; unit?: string; trend: number; icon: React.ComponentType<{ className?: string }>; spark: number[]; progress?: number }) {
  const up = trend >= 0;
  return (
    <div className="group rounded-lg border bg-card p-4 transition-colors hover:border-primary/40">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        <Icon className="size-4 transition-colors group-hover:text-primary" />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        <span className={cn("ml-auto inline-flex items-center gap-0.5 text-xs", up ? "text-success" : "text-destructive")}>
          {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}{Math.abs(trend)}%
        </span>
      </div>
      <Sparkline data={spark} />
      {progress !== undefined && <Meter value={progress} className="mt-2" />}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <div className="rounded-full border bg-muted p-3"><Inbox className="size-5 text-muted-foreground" /></div>
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="max-w-sm text-xs text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}

export function Confirm({ trigger, title, description, confirmLabel = "Confirm", destructive, onConfirm }: { trigger: ReactNode; title: string; description: string; confirmLabel?: string; destructive?: boolean; onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={cn(destructive && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function Masked({ value }: { value: string }) {
  const [show, setShow] = useState(false);
  return (
    <button type="button" onClick={() => setShow((s) => !s)} className="max-w-full truncate rounded bg-muted px-2 py-0.5 text-left font-mono text-xs hover:text-primary" title={show ? "Hide" : "Reveal"}>
      {show ? value : "•".repeat(Math.min(24, value.length))}
    </button>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search…" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder}
      className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60 sm:w-64" />
  );
}

export const chartTooltip = {
  contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "var(--muted-foreground)" },
};
export const axis = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false };

/** Scrollable table wrapper for mobile. */
export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="-mx-4 overflow-x-auto scrollbar-thin px-4"><table className="w-full min-w-[640px] text-sm">{children}</table></div>;
}
export const th = "pb-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground";
export const td = "border-t py-2.5 pr-3 align-middle";
