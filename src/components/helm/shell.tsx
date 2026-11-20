import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, ChevronsLeft, ChevronsRight, ChevronDown, Menu, Search, Settings, Palette, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api, DEMO_MODE } from "@/lib/helm/api";
import { ConnectionBadge, DemoNotice, DemoTag } from "@/components/helm/ui";
import { nav, flatNav } from "./nav";
import { StatusBadge, timeAgo } from "./ui";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ServerCtx = createContext<{ serverId: string; setServerId: (s: string) => void }>({ serverId: "fra-01", setServerId: () => {} });
export const useActiveServer = () => useContext(ServerCtx);

function Logo({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-1">
      <svg viewBox="0 0 32 32" className="size-7 shrink-0 text-primary" aria-hidden>
        <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="16" cy="16" r="4" fill="currentColor" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <line key={a} x1="16" y1="3" x2="16" y2="8" stroke="currentColor" strokeWidth="1.6" transform={`rotate(${a} 16 16)`} />)}
      </svg>
      {!compact && <span className="text-[15px] font-semibold tracking-[0.25em]">HELM</span>}
    </Link>
  );
}

function NavList({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const active = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto scrollbar-thin px-2 py-3">
      {nav.map((g) => (
        <div key={g.group}>
          {!collapsed && <p className="mb-1 px-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">{g.group}</p>}
          <ul className="space-y-0.5">
            {g.items.map((it) => {
              const link = (
                <Link to={it.to} onClick={onNavigate}
                  className={cn("flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
                    active(it.to) && "bg-sidebar-accent text-foreground shadow-[inset_2px_0_0_var(--primary)]", collapsed && "justify-center")}>
                  <it.icon className={cn("size-4 shrink-0", active(it.to) && "text-primary")} />
                  {!collapsed && <span>{it.title}</span>}
                </Link>
              );
              return <li key={it.to}>{collapsed ? <Tooltip><TooltipTrigger asChild>{link}</TooltipTrigger><TooltipContent side="right">{it.title}</TooltipContent></Tooltip> : link}</li>;
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarFooter({ collapsed, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
  const { serverId } = useActiveServer();
  const { data } = useQuery(api.servers);
  const s = data?.find((x) => x.id === serverId);
  return (
    <div className="space-y-2 border-t p-2">
      {!collapsed && s && (
        <Link to="/servers/$id" params={{ id: s.id }} className="block rounded-md border bg-background/50 p-2.5 hover:border-primary/40">
          <div className="flex items-center justify-between"><span className="font-mono text-xs">{s.name}</span><span className="flex items-center gap-1">{DEMO_MODE && <DemoTag />}<StatusBadge status={s.status} /></span></div>
          <div className="mt-1.5 flex gap-3 text-[11px] text-muted-foreground"><span>CPU {s.cpu}%</span><span>RAM {s.ram}%</span><span>{s.region}</span></div>
        </Link>
      )}
      <div className={cn("flex items-center gap-2", collapsed && "flex-col")}>
        <Link to="/settings" className="flex min-w-0 flex-1 items-center gap-2 rounded-md p-1.5 hover:bg-sidebar-accent" title="Account settings">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">SD</span>
          {!collapsed && <span className="min-w-0"><span className="block truncate text-sm">Sachith Dev</span><span className="block truncate text-[11px] text-muted-foreground">Owner · HELM Demo</span></span>}
        </Link>
        {onToggle && (
          <button onClick={onToggle} className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function Breadcrumbs() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const segs = path.split("/").filter(Boolean);
  const top = flatNav.find((n) => n.to === `/${segs[0] ?? ""}`) ?? flatNav[0]!;
  return (
    <ol className="flex min-w-0 items-center gap-1.5 text-sm">
      <li className="hidden text-muted-foreground sm:block">HELM Demo</li>
      <li className="hidden text-muted-foreground/50 sm:block">/</li>
      <li><Link to={top.to} className={cn(segs.length > 1 ? "text-muted-foreground hover:text-foreground" : "font-medium")}>{top.title}</Link></li>
      {segs[1] && <><li className="text-muted-foreground/50">/</li><li className="truncate font-mono text-xs font-medium">{decodeURIComponent(segs[1])}</li></>}
    </ol>
  );
}

function NotificationBell() {
  const { data = [] } = useQuery(api.notifications);
  const unread = data.filter((n) => !n.read);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Notifications">
          <Bell className="size-4" />
          {unread.length > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2"><span className="text-sm font-medium">Notifications</span><span className="text-xs text-muted-foreground">{unread.length} unread</span></div>
        <ul className="max-h-80 overflow-y-auto">
          {data.slice(0, 5).map((n) => (
            <li key={n.id} className="border-b px-3 py-2.5 last:border-0">
              <div className="flex items-center gap-2"><StatusBadge status={n.level} /><span className="ml-auto text-[11px] text-muted-foreground">{timeAgo(n.at)}</span></div>
              <p className="mt-1 text-sm">{n.title}</p>
            </li>
          ))}
        </ul>
        <Link to="/notifications" className="block border-t px-3 py-2 text-center text-xs text-primary hover:underline">Open notification center</Link>
      </PopoverContent>
    </Popover>
  );
}

function ServerSelector() {
  const { serverId, setServerId } = useActiveServer();
  const { data = [] } = useQuery(api.servers);
  const s = data.find((x) => x.id === serverId);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hidden h-8 items-center gap-2 rounded-md border bg-card px-2.5 text-xs hover:border-primary/40 md:flex">
        <span className={cn("size-1.5 rounded-full", s?.status === "online" ? "bg-success" : s?.status === "degraded" ? "bg-warning" : "bg-destructive")} />
        <span className="font-mono">{s?.name ?? "Select server"}</span><ChevronDown className="size-3 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Active server</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={serverId} onValueChange={(v) => { setServerId(v); toast.success(`Switched to ${data.find((x) => x.id === v)?.name}`); }}>
          {data.map((x) => <DropdownMenuRadioItem key={x.id} value={x.id}><span className="font-mono text-xs">{x.name}</span><span className="ml-auto text-[11px] text-muted-foreground">{x.region}</span></DropdownMenuRadioItem>)}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (o: boolean) => void }) {
  const navigate = useNavigate();
  const { data: projects = [] } = useQuery(api.projects);
  const { data: servers = [] } = useQuery(api.servers);
  const go = (fn: () => void) => { setOpen(false); fn(); };
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, projects, servers…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {flatNav.map((n) => <CommandItem key={n.to} onSelect={() => go(() => navigate({ to: n.to }))}><n.icon className="mr-2 size-4" />{n.title}</CommandItem>)}
        </CommandGroup>
        <CommandGroup heading="Projects">
          {projects.map((p) => <CommandItem key={p.id} onSelect={() => go(() => navigate({ to: "/projects", search: { q: p.name } }))}>{p.name}<span className="ml-auto text-xs text-muted-foreground">{p.framework}</span></CommandItem>)}
        </CommandGroup>
        <CommandGroup heading="Servers">
          {servers.map((s) => <CommandItem key={s.id} onSelect={() => go(() => navigate({ to: "/servers/$id", params: { id: s.id } }))}>{s.name}<span className="ml-auto font-mono text-xs text-muted-foreground">{s.ip}</span></CommandItem>)}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [cmd, setCmd] = useState(false);
  const [serverId, setServerId] = useState("fra-01");
  const [density, setDensity] = useState("comfortable");

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setCmd((o) => !o); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <ServerCtx.Provider value={{ serverId, setServerId }}>
      <TooltipProvider delayDuration={200}>
        <div className={cn("flex min-h-screen w-full bg-background", density === "compact" && "text-[13px]")}>
          <aside className={cn("sticky top-0 hidden h-screen shrink-0 flex-col border-r bg-sidebar transition-[width] duration-200 md:flex", collapsed ? "w-16" : "w-60")}>
            <div className="flex h-14 items-center border-b px-3"><Logo compact={collapsed} /></div>
            <NavList collapsed={collapsed} />
            <SidebarFooter collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
          </aside>

          <Sheet open={mobile} onOpenChange={setMobile}>
            <SheetContent side="left" className="flex w-72 flex-col bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-14 items-center border-b px-3"><Logo /></div>
              <NavList onNavigate={() => setMobile(false)} />
              <SidebarFooter />
            </SheetContent>
          </Sheet>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md">
              <button className="rounded-md p-2 text-muted-foreground hover:bg-accent md:hidden" onClick={() => setMobile(true)} aria-label="Open navigation"><Menu className="size-4" /></button>
              <Breadcrumbs />
              <div className="ml-auto flex items-center gap-1.5">
                <button onClick={() => setCmd(true)} className="hidden h-8 w-64 items-center gap-2 rounded-md border bg-card px-2.5 text-xs text-muted-foreground hover:border-primary/40 lg:flex">
                  <Search className="size-3.5" />Search or run a command<kbd className="ml-auto rounded border bg-muted px-1.5 font-mono text-[10px]">⌘K</kbd>
                </button>
                <button onClick={() => setCmd(true)} className="rounded-md p-2 text-muted-foreground hover:bg-accent lg:hidden" aria-label="Search"><Search className="size-4" /></button>
                <ServerSelector />
                <ConnectionBadge className="hidden sm:inline-flex" />
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Theme settings"><Palette className="size-4" /></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Interface density</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={density} onValueChange={setDensity}>
                      <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator /><DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Theme: HELM Midnight</DropdownMenuLabel>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger className="ml-1 grid size-8 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary ring-1 ring-primary/30" aria-label="Account menu">SD</DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>sachith@demo.helm.run</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link to="/settings"><User className="mr-2 size-4" />Profile</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/settings"><Settings className="mr-2 size-4" />Account settings</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/security"><LogOut className="mr-2 size-4" />Manage sessions</Link></DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
            <main className="mx-auto w-full max-w-[1440px] flex-1 p-4 sm:p-6">{DEMO_MODE && <DemoNotice />}{children}</main>
          </div>
        </div>
        <CommandPalette open={cmd} setOpen={setCmd} />
      </TooltipProvider>
    </ServerCtx.Provider>
  );
}
