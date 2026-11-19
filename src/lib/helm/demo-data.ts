// DEMO MODE data. Everything here is fictional and only served when DEMO_MODE is true (see api.ts).
import type * as T from "./types";

const now = Date.now();
const ago = (m: number) => new Date(now - m * 60_000).toISOString();
const series = (n: number, base: number, amp: number, seed = 1) =>
  Array.from({ length: n }, (_, i) => Math.max(0, Math.round((base + Math.sin(i / 3 + seed) * amp + Math.cos(i * seed) * amp * 0.4) * 10) / 10));

export const servers: T.Server[] = [
  { id: "fra-01", name: "fra-prod-01", ip: "88.198.42.17", region: "Frankfurt", os: "Ubuntu 24.04 LTS", cores: 16, ramGb: 64, storageGb: 1024, uptimeDays: 142, status: "online", docker: "running", cpu: 42, ram: 61, disk: 48 },
  { id: "ams-02", name: "ams-edge-02", ip: "145.12.88.203", region: "Amsterdam", os: "Debian 12", cores: 8, ramGb: 32, storageGb: 512, uptimeDays: 67, status: "online", docker: "running", cpu: 23, ram: 44, disk: 31 },
  { id: "nyc-03", name: "nyc-worker-03", ip: "104.24.91.6", region: "New York", os: "Ubuntu 22.04 LTS", cores: 32, ramGb: 128, storageGb: 2048, uptimeDays: 12, status: "degraded", docker: "running", cpu: 88, ram: 79, disk: 72 },
  { id: "sgp-04", name: "sgp-staging-04", ip: "128.199.7.45", region: "Singapore", os: "Rocky Linux 9", cores: 4, ramGb: 16, storageGb: 256, uptimeDays: 0, status: "offline", docker: "stopped", cpu: 0, ram: 0, disk: 22 },
];

export const projects: T.Project[] = [
  { id: "p1", name: "atlas-web", framework: "Next.js", repo: "github.com/northwind/atlas-web", branch: "main", url: "atlas.northwind.io", status: "live", frontend: "healthy", backend: "healthy", lastDeploy: ago(14), serverId: "fra-01" },
  { id: "p2", name: "ledger-api", framework: "NestJS", repo: "github.com/northwind/ledger-api", branch: "main", url: "api.ledger.dev", status: "building", frontend: "none", backend: "healthy", lastDeploy: ago(2), serverId: "fra-01" },
  { id: "p3", name: "orbit-dashboard", framework: "Vite", repo: "github.com/northwind/orbit", branch: "develop", url: "orbit.northwind.io", status: "live", frontend: "healthy", backend: "degraded", lastDeploy: ago(180), serverId: "ams-02" },
  { id: "p4", name: "pulse-ingest", framework: "Go", repo: "github.com/northwind/pulse", branch: "main", url: "ingest.pulse.sh", status: "failed", frontend: "none", backend: "down", lastDeploy: ago(55), serverId: "nyc-03" },
  { id: "p5", name: "marketing-site", framework: "Astro", repo: "github.com/northwind/site", branch: "main", url: "northwind.io", status: "live", frontend: "healthy", backend: "none", lastDeploy: ago(1440), serverId: "ams-02" },
  { id: "p6", name: "ml-inference", framework: "FastAPI", repo: "github.com/northwind/infer", branch: "gpu", url: "infer.northwind.io", status: "paused", frontend: "none", backend: "down", lastDeploy: ago(4320), serverId: "nyc-03" },
];

export const deployments: T.Deployment[] = [
  { id: "d-9f2a", project: "ledger-api", commit: "a3f9c21", message: "feat: idempotent payment intents", branch: "main", author: "mira", status: "building", durationSec: 74, createdAt: ago(2), url: "api.ledger.dev" },
  { id: "d-9f29", project: "atlas-web", commit: "7be04d1", message: "fix: hydrate search filters from URL", branch: "main", author: "jonas", status: "live", durationSec: 128, createdAt: ago(14), url: "atlas.northwind.io" },
  { id: "d-9f28", project: "pulse-ingest", commit: "c11e8a0", message: "chore: bump kafka client", branch: "main", author: "ade", status: "failed", durationSec: 41, createdAt: ago(55), url: "ingest.pulse.sh" },
  { id: "d-9f27", project: "orbit-dashboard", commit: "52d7f9e", message: "feat: team-level usage charts", branch: "develop", author: "mira", status: "live", durationSec: 96, createdAt: ago(180), url: "orbit.northwind.io" },
  { id: "d-9f26", project: "atlas-web", commit: "e8a31bc", message: "perf: stream product grid", branch: "main", author: "jonas", status: "superseded", durationSec: 131, createdAt: ago(600), url: "atlas.northwind.io" },
  { id: "d-9f25", project: "marketing-site", commit: "0f4c2d7", message: "content: pricing update", branch: "main", author: "lea", status: "live", durationSec: 38, createdAt: ago(1440), url: "northwind.io" },
];

export const queue: T.Deployment[] = [
  { id: "d-9f2b", project: "atlas-web", commit: "91ac4f2", message: "feat: saved carts", branch: "main", author: "jonas", status: "queued", durationSec: 0, createdAt: ago(1), url: "atlas.northwind.io" },
  { id: "d-9f2c", project: "orbit-dashboard", commit: "3de71b8", message: "fix: tooltip overflow", branch: "develop", author: "ade", status: "queued", durationSec: 0, createdAt: ago(0), url: "orbit.northwind.io" },
];

export const metrics = (points = 24): T.MetricPoint[] => {
  const cpu = series(points, 45, 18, 1), ram = series(points, 60, 8, 2), rx = series(points, 320, 140, 3), tx = series(points, 180, 90, 4), disk = series(points, 48, 3, 5);
  return cpu.map((c, i) => ({ t: i, cpu: Math.min(100, c), ram: Math.min(100, ram[i] ?? 0), rx: rx[i] ?? 0, tx: tx[i] ?? 0, disk: disk[i] ?? 0 }));
};

export const processes: T.Process[] = [
  { pid: 1842, name: "node /srv/atlas/server.js", user: "deploy", cpu: 18.4, mem: 7.2 },
  { pid: 2210, name: "postgres: writer", user: "postgres", cpu: 9.1, mem: 12.6 },
  { pid: 913, name: "dockerd", user: "root", cpu: 4.8, mem: 2.1 },
  { pid: 3107, name: "redis-server *:6379", user: "redis", cpu: 3.2, mem: 4.4 },
  { pid: 4022, name: "nginx: worker process", user: "www-data", cpu: 1.9, mem: 0.6 },
  { pid: 5511, name: "pulse-ingest", user: "deploy", cpu: 1.1, mem: 3.8 },
];

export const containers: T.Container[] = [
  { id: "c1", name: "atlas-web", image: "atlas-web:7be04d1", status: "running", cpu: 18, mem: 612, uptime: "14m" },
  { id: "c2", name: "ledger-api", image: "ledger-api:prev", status: "running", cpu: 11, mem: 488, uptime: "3d" },
  { id: "c3", name: "postgres-main", image: "postgres:16.2", status: "running", cpu: 9, mem: 2048, uptime: "21d" },
  { id: "c4", name: "redis-cache", image: "redis:7.2", status: "running", cpu: 3, mem: 256, uptime: "21d" },
  { id: "c5", name: "pulse-ingest", image: "pulse:c11e8a0", status: "exited", cpu: 0, mem: 0, uptime: "—" },
];

export const domains: T.Domain[] = [
  { id: "dm1", name: "atlas.northwind.io", project: "atlas-web", ssl: "valid", https: true, expires: "2027-02-11", dns: "verified", records: [{ type: "A", name: "@", value: "88.198.42.17" }, { type: "CNAME", name: "www", value: "atlas.northwind.io" }] },
  { id: "dm2", name: "api.ledger.dev", project: "ledger-api", ssl: "valid", https: true, expires: "2026-12-02", dns: "verified", records: [{ type: "A", name: "api", value: "88.198.42.17" }] },
  { id: "dm3", name: "ingest.pulse.sh", project: "pulse-ingest", ssl: "expiring", https: true, expires: "2026-11-24", dns: "verified", records: [{ type: "CNAME", name: "ingest", value: "nyc-03.helm.run" }] },
  { id: "dm4", name: "beta.orbit.app", project: "orbit-dashboard", ssl: "none", https: false, expires: "—", dns: "pending", records: [{ type: "A", name: "beta", value: "145.12.88.203" }] },
];

export const databases: T.Database[] = [
  { id: "db1", name: "ledger-primary", engine: "PostgreSQL", version: "16.2", status: "running", usedGb: 38.4, sizeGb: 100, connections: 42, maxConnections: 200, host: "10.0.1.12", port: 5432 },
  { id: "db2", name: "atlas-catalog", engine: "MySQL", version: "8.0.36", status: "running", usedGb: 12.1, sizeGb: 50, connections: 18, maxConnections: 150, host: "10.0.1.14", port: 3306 },
  { id: "db3", name: "pulse-events", engine: "MongoDB", version: "7.0", status: "stopped", usedGb: 71.9, sizeGb: 200, connections: 0, maxConnections: 500, host: "10.0.3.8", port: 27017 },
  { id: "db4", name: "session-cache", engine: "Redis", version: "7.2", status: "running", usedGb: 1.4, sizeGb: 8, connections: 116, maxConnections: 1000, host: "10.0.1.20", port: 6379 },
];

export const files: T.FileNode = {
  name: "/", type: "folder", children: [
    { name: "srv", type: "folder", children: [
      { name: "atlas-web", type: "folder", children: [
        { name: "package.json", type: "file", size: 1840, modified: ago(14), content: '{\n  "name": "atlas-web",\n  "version": "3.4.1",\n  "scripts": {\n    "build": "next build",\n    "start": "next start -p 3000"\n  }\n}\n' },
        { name: "next.config.mjs", type: "file", size: 412, modified: ago(900), content: "export default {\n  output: 'standalone',\n  images: { remotePatterns: [] },\n};\n" },
        { name: "public", type: "folder", children: [{ name: "logo.svg", type: "file", size: 2310, modified: ago(9000), content: "<svg />" }] },
      ] },
      { name: "ledger-api", type: "folder", children: [{ name: "Dockerfile", type: "file", size: 640, modified: ago(2), content: "FROM node:20-alpine\nWORKDIR /app\nCOPY . .\nRUN npm ci && npm run build\nCMD [\"node\", \"dist/main.js\"]\n" }] },
    ] },
    { name: "etc", type: "folder", children: [{ name: "nginx", type: "folder", children: [{ name: "nginx.conf", type: "file", size: 2984, modified: ago(20000), content: "worker_processes auto;\nevents { worker_connections 1024; }\nhttp {\n  include /etc/nginx/sites-enabled/*;\n}\n" }] }] },
    { name: ".env.production", type: "file", size: 220, modified: ago(3000), content: "NODE_ENV=production\nPORT=3000\n" },
  ],
};

export const activity: T.Activity[] = [
  { id: "a1", kind: "deploy", text: "mira started deployment of ledger-api", at: ago(2) },
  { id: "a2", kind: "alert", text: "CPU above 85% on nyc-worker-03", at: ago(9) },
  { id: "a3", kind: "deploy", text: "atlas-web is live (7be04d1)", at: ago(14) },
  { id: "a4", kind: "security", text: "New SSH key added by jonas", at: ago(48) },
  { id: "a5", kind: "error", text: "pulse-ingest build failed at TEST", at: ago(55) },
  { id: "a6", kind: "backup", text: "Nightly backup of ledger-primary completed", at: ago(320) },
];

export const backups: T.Backup[] = [
  { id: "b1", target: "ledger-primary", kind: "database", sizeGb: 4.2, status: "completed", at: ago(320), location: "s3://helm-backups/fra" },
  { id: "b2", target: "atlas-web", kind: "project", sizeGb: 0.8, status: "completed", at: ago(720), location: "s3://helm-backups/fra" },
  { id: "b3", target: "pulse-events", kind: "database", sizeGb: 11.6, status: "failed", at: ago(1500), location: "s3://helm-backups/nyc" },
  { id: "b4", target: "session-cache", kind: "database", sizeGb: 0.2, status: "completed", at: ago(1800), location: "local:/var/backups" },
  { id: "b5", target: "orbit-dashboard", kind: "project", sizeGb: 0.5, status: "running", at: ago(1), location: "s3://helm-backups/ams" },
];

export const schedules: T.Schedule[] = [
  { id: "s1", name: "Nightly databases", cron: "0 2 * * *", target: "All databases", retention: 14, enabled: true },
  { id: "s2", name: "Weekly projects", cron: "0 4 * * 0", target: "All projects", retention: 8, enabled: true },
  { id: "s3", name: "Hourly ledger", cron: "0 * * * *", target: "ledger-primary", retention: 48, enabled: false },
];

export const cronJobs: T.CronJob[] = [
  { id: "cj1", name: "Purge expired sessions", schedule: "*/15 * * * *", command: "node scripts/purge.js", server: "fra-prod-01", lastRun: ago(6), lastStatus: "success", enabled: true },
  { id: "cj2", name: "Rotate nginx logs", schedule: "0 0 * * *", command: "logrotate /etc/logrotate.d/nginx", server: "ams-edge-02", lastRun: ago(1340), lastStatus: "success", enabled: true },
  { id: "cj3", name: "Sync exchange rates", schedule: "0 */6 * * *", command: "curl -X POST localhost:4000/rates/sync", server: "fra-prod-01", lastRun: ago(200), lastStatus: "failed", enabled: true },
  { id: "cj4", name: "Rebuild search index", schedule: "30 3 * * 1", command: "npm run reindex", server: "nyc-worker-03", lastRun: ago(8000), lastStatus: "success", enabled: false },
];

export const workers: T.Worker[] = [
  { id: "w1", name: "email-dispatch", queue: "emails", concurrency: 8, processed: 182_430, failed: 12, status: "running", server: "fra-prod-01" },
  { id: "w2", name: "image-resize", queue: "media", concurrency: 4, processed: 54_120, failed: 3, status: "running", server: "ams-edge-02" },
  { id: "w3", name: "webhook-fanout", queue: "webhooks", concurrency: 16, processed: 901_772, failed: 418, status: "degraded", server: "nyc-worker-03" },
  { id: "w4", name: "report-export", queue: "reports", concurrency: 2, processed: 3_204, failed: 0, status: "stopped", server: "fra-prod-01" },
];

export const buckets: T.Bucket[] = [
  { id: "bk1", name: "atlas-assets", region: "eu-central", objects: 48_210, usedGb: 182, public: true },
  { id: "bk2", name: "ledger-invoices", region: "eu-central", objects: 129_004, usedGb: 64, public: false },
  { id: "bk3", name: "helm-backups", region: "multi", objects: 1_820, usedGb: 940, public: false },
  { id: "bk4", name: "pulse-archive", region: "us-east", objects: 2_400_118, usedGb: 1410, public: false },
];

export const apiKeys: T.ApiKey[] = [
  { id: "k1", name: "CI deploy token", prefix: "helm_live_8fK2", secret: "helm_live_8fK2x9QpL0vB7nRt3sWm", scopes: ["deploy", "read"], created: "2026-08-02", lastUsed: ago(3) },
  { id: "k2", name: "Grafana read-only", prefix: "helm_live_Q1zA", secret: "helm_live_Q1zA4uYhN6cE2jDk8pTo", scopes: ["read"], created: "2026-05-19", lastUsed: ago(1) },
  { id: "k3", name: "Legacy script", prefix: "helm_live_m0Pc", secret: "helm_live_m0Pc7rHs1aVq5bXy9eGi", scopes: ["admin"], created: "2025-12-01", lastUsed: ago(60000) },
];

export const endpoints: T.Endpoint[] = [
  { id: "e1", method: "GET", path: "/v1/ledger/accounts", project: "ledger-api", rpm: 1820, p95: 84, errorRate: 0.2 },
  { id: "e2", method: "POST", path: "/v1/ledger/payments", project: "ledger-api", rpm: 412, p95: 212, errorRate: 1.4 },
  { id: "e3", method: "GET", path: "/api/products", project: "atlas-web", rpm: 3104, p95: 61, errorRate: 0.1 },
  { id: "e4", method: "POST", path: "/ingest", project: "pulse-ingest", rpm: 0, p95: 0, errorRate: 100 },
  { id: "e5", method: "DELETE", path: "/v1/ledger/sessions/:id", project: "ledger-api", rpm: 38, p95: 45, errorRate: 0 },
];

export const sessions: T.Session[] = [
  { id: "ss1", device: "MacBook Pro · Chrome 131", ip: "82.135.10.4", location: "Berlin, DE", lastActive: ago(0), current: true },
  { id: "ss2", device: "iPhone 16 · Safari", ip: "82.135.10.9", location: "Berlin, DE", lastActive: ago(240) },
  { id: "ss3", device: "Linux · helm-cli 2.4", ip: "18.194.2.77", location: "Frankfurt, DE", lastActive: ago(30) },
];

export const logins: T.LoginEvent[] = [
  { id: "l1", user: "sachith", ip: "82.135.10.4", location: "Berlin, DE", at: ago(5), ok: true },
  { id: "l2", user: "jonas", ip: "91.64.2.18", location: "Hamburg, DE", at: ago(130), ok: true },
  { id: "l3", user: "unknown", ip: "45.155.205.11", location: "Unknown", at: ago(300), ok: false },
  { id: "l4", user: "mira", ip: "62.210.4.90", location: "Paris, FR", at: ago(600), ok: true },
];

export const firewall: T.FirewallRule[] = [
  { id: "f1", action: "allow", port: "443", protocol: "TCP", source: "0.0.0.0/0", note: "HTTPS" },
  { id: "f2", action: "allow", port: "80", protocol: "TCP", source: "0.0.0.0/0", note: "HTTP redirect" },
  { id: "f3", action: "allow", port: "22", protocol: "TCP", source: "82.135.10.0/24", note: "Office SSH" },
  { id: "f4", action: "deny", port: "5432", protocol: "TCP", source: "0.0.0.0/0", note: "Block public Postgres" },
];

export const audit: T.AuditEvent[] = [
  { id: "au1", actor: "sachith", action: "firewall.rule.create", target: "port 22 · office", at: ago(40) },
  { id: "au2", actor: "jonas", action: "ssh_key.add", target: "jonas@thinkpad", at: ago(48) },
  { id: "au3", actor: "mira", action: "deployment.rollback", target: "atlas-web → e8a31bc", at: ago(2900) },
  { id: "au4", actor: "system", action: "ssl.renew", target: "api.ledger.dev", at: ago(5000) },
];

export const vulns: T.Vulnerability[] = [
  { id: "v1", pkg: "openssl 3.0.2", severity: "high", cve: "CVE-2026-1182", server: "nyc-worker-03", fix: "3.0.15" },
  { id: "v2", pkg: "next 14.1.0", severity: "medium", cve: "CVE-2026-0931", server: "fra-prod-01", fix: "14.2.9" },
  { id: "v3", pkg: "libxml2 2.9.13", severity: "low", cve: "CVE-2025-7731", server: "ams-edge-02", fix: "2.9.14" },
];

export const secrets: T.Secret[] = [
  { id: "sc1", key: "DATABASE_URL", value: "postgres://ledger:Zr8u2!kq@10.0.1.12:5432/ledger", project: "ledger-api", updated: ago(9000) },
  { id: "sc2", key: "STRIPE_SECRET_KEY", value: "sk_live_51NwX0aQ8fYy2v", project: "ledger-api", updated: ago(20000) },
  { id: "sc3", key: "NEXTAUTH_SECRET", value: "c2b7f91e6d4a08b3e5f1", project: "atlas-web", updated: ago(40000) },
];

export const notifications: T.Notification[] = [
  { id: "n1", level: "error", title: "Build failed: pulse-ingest", body: "Step TEST exited with code 1.", at: ago(55), read: false, category: "deployment" },
  { id: "n2", level: "warning", title: "High CPU on nyc-worker-03", body: "Sustained 88% over 10 minutes.", at: ago(9), read: false, category: "server" },
  { id: "n3", level: "warning", title: "SSL expiring soon", body: "ingest.pulse.sh expires in 6 days.", at: ago(400), read: false, category: "server" },
  { id: "n4", level: "success", title: "atlas-web is live", body: "Deployment d-9f29 promoted to production.", at: ago(14), read: true, category: "deployment" },
  { id: "n5", level: "info", title: "Backup completed", body: "ledger-primary · 4.2 GB", at: ago(320), read: true, category: "database" },
];

export const plugins: T.Plugin[] = [
  { id: "pl1", name: "Uptime Sentinel", description: "Multi-region HTTP checks with incident timelines.", version: "2.3.0", developer: "HELM Labs", installed: true, icon: "Activity" },
  { id: "pl2", name: "Cloudflare Sync", description: "Mirror DNS records and purge cache on deploy.", version: "1.8.2", developer: "HELM Labs", installed: true, icon: "Cloud" },
  { id: "pl3", name: "Log Drain", description: "Ship logs to Datadog, Axiom or any HTTPS endpoint.", version: "0.9.4", developer: "Axon Tools", installed: false, icon: "ScrollText" },
  { id: "pl4", name: "Preview Environments", description: "Ephemeral deployments for every pull request.", version: "3.1.0", developer: "HELM Labs", installed: false, icon: "GitPullRequest" },
  { id: "pl5", name: "Fail2Ban Manager", description: "Visual jail rules and banned IP management.", version: "1.2.1", developer: "Bastion OSS", installed: false, icon: "ShieldBan" },
  { id: "pl6", name: "Cost Insights", description: "Per-project resource cost breakdown and forecasts.", version: "0.6.0", developer: "Ledgerline", installed: false, icon: "PieChart" },
];

export const pipeline: T.PipelineStep[] = [
  { name: "SOURCE", status: "completed", sec: 3 },
  { name: "INSTALL", status: "completed", sec: 22 },
  { name: "BUILD", status: "running", sec: 41 },
  { name: "TEST", status: "waiting", sec: 0 },
  { name: "DEPLOY", status: "waiting", sec: 0 },
  { name: "HEALTH CHECK", status: "waiting", sec: 0 },
  { name: "LIVE", status: "waiting", sec: 0 },
];

export const buildLogs: T.LogLine[] = [
  ["info", "Cloning github.com/northwind/ledger-api@a3f9c21"],
  ["info", "Detected NestJS · Node 20.11 · npm 10"],
  ["info", "npm ci --omit=dev=false"],
  ["warn", "npm WARN deprecated glob@7.2.3"],
  ["info", "added 812 packages in 21.4s"],
  ["info", "nest build"],
  ["debug", "tsc -p tsconfig.build.json"],
].map(([level, msg]: string[], i) => ({ id: i, ts: new Date(now - (7 - i) * 6000).toISOString(), level: level as T.LogLine["level"], msg: msg ?? "" }));
