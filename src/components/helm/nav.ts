import { Activity, Archive, Bell, Boxes, Cable, Clock, Cpu, Database, FolderTree, Gauge, Globe, HardDrive, LayoutGrid, Plug, Rocket, Server, Settings, Shield, SquareTerminal } from "lucide-react";

export const nav = [
  { group: "Platform", items: [
    { title: "Overview", to: "/", icon: Gauge },
    { title: "Projects", to: "/projects", icon: LayoutGrid },
    { title: "Deployments", to: "/deployments", icon: Rocket },
    { title: "Servers", to: "/servers", icon: Server },
    { title: "Domains", to: "/domains", icon: Globe },
    { title: "Databases", to: "/databases", icon: Database },
  ] },
  { group: "Operate", items: [
    { title: "File Manager", to: "/files", icon: FolderTree },
    { title: "Terminal", to: "/terminal", icon: SquareTerminal },
    { title: "Monitoring", to: "/monitoring", icon: Activity },
    { title: "Backups", to: "/backups", icon: Archive },
    { title: "Cron Jobs", to: "/cron", icon: Clock },
    { title: "Workers", to: "/workers", icon: Cpu },
    { title: "Storage", to: "/storage", icon: HardDrive },
    { title: "API Manager", to: "/api-manager", icon: Cable },
  ] },
  { group: "Account", items: [
    { title: "Security", to: "/security", icon: Shield },
    { title: "Notifications", to: "/notifications", icon: Bell },
    { title: "Plugins", to: "/plugins", icon: Plug },
    { title: "Settings", to: "/settings", icon: Settings },
  ] },
] as const;

type NavItem = (typeof nav)[number]["items"][number];
export const flatNav: NavItem[] = nav.flatMap((g) => [...g.items] as NavItem[]);
export type NavPath = NavItem["to"];
export { Boxes };
