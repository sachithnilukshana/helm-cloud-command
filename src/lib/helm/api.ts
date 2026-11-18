import { queryOptions } from "@tanstack/react-query";
import * as demo from "./demo-data";

/**
 * HELM API layer. Pages only call these query options, never the data module directly.
 * DEMO_MODE serves fictional data; swap `fetcher` for real HTTP calls to integrate a backend.
 */
export const DEMO_MODE = true;

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
async function fetcher<T>(key: string, demoValue: () => T): Promise<T> {
  if (DEMO_MODE) {
    await delay();
    return structuredClone(demoValue());
  }
  const res = await fetch(`/api/helm/${key}`);
  if (!res.ok) throw new Error(`Request failed: ${key}`);
  return res.json();
}

const q = <T,>(key: string, fn: () => T) => queryOptions({ queryKey: ["helm", key], queryFn: () => fetcher(key, fn), staleTime: 30_000 });

export const api = {
  servers: q("servers", () => demo.servers),
  projects: q("projects", () => demo.projects),
  deployments: q("deployments", () => ({ history: demo.deployments, queue: demo.queue, pipeline: demo.pipeline, logs: demo.buildLogs })),
  metrics: (range: string) => {
    const n = { "1h": 30, "6h": 36, "24h": 48, "7d": 42, "30d": 60 }[range] ?? 24;
    return queryOptions({ queryKey: ["helm", "metrics", range], queryFn: () => fetcher(`metrics?range=${range}`, () => demo.metrics(n)), staleTime: 30_000 });
  },
  processes: q("processes", () => demo.processes),
  containers: q("containers", () => demo.containers),
  domains: q("domains", () => demo.domains),
  databases: q("databases", () => demo.databases),
  files: q("files", () => demo.files),
  activity: q("activity", () => demo.activity),
  backups: q("backups", () => ({ backups: demo.backups, schedules: demo.schedules })),
  cron: q("cron", () => demo.cronJobs),
  workers: q("workers", () => demo.workers),
  buckets: q("buckets", () => demo.buckets),
  apiManager: q("api-manager", () => ({ keys: demo.apiKeys, endpoints: demo.endpoints })),
  security: q("security", () => ({ sessions: demo.sessions, logins: demo.logins, firewall: demo.firewall, audit: demo.audit, vulns: demo.vulns, secrets: demo.secrets, keys: demo.apiKeys })),
  notifications: q("notifications", () => demo.notifications),
  plugins: q("plugins", () => demo.plugins),
};
