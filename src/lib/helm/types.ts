export type Health = "healthy" | "degraded" | "down" | "none";
export interface Server { id: string; name: string; ip: string; region: string; os: string; cores: number; ramGb: number; storageGb: number; uptimeDays: number; status: "online" | "degraded" | "offline"; docker: "running" | "stopped"; cpu: number; ram: number; disk: number }
export interface Project { id: string; name: string; framework: string; repo: string; branch: string; url: string; status: "live" | "building" | "failed" | "paused"; frontend: Health; backend: Health; lastDeploy: string; serverId: string }
export interface Deployment { id: string; project: string; commit: string; message: string; branch: string; author: string; status: "queued" | "building" | "live" | "failed" | "superseded" | "cancelled"; durationSec: number; createdAt: string; url: string }
export interface MetricPoint { t: number; cpu: number; ram: number; rx: number; tx: number; disk: number }
export interface Process { pid: number; name: string; user: string; cpu: number; mem: number }
export interface Container { id: string; name: string; image: string; status: "running" | "exited"; cpu: number; mem: number; uptime: string }
export interface DnsRecord { type: "A" | "CNAME" | "TXT"; name: string; value: string }
export interface Domain { id: string; name: string; project: string; ssl: "valid" | "expiring" | "none"; https: boolean; expires: string; dns: "verified" | "pending" | "failed"; records: DnsRecord[] }
export interface Database { id: string; name: string; engine: "PostgreSQL" | "MySQL" | "MongoDB" | "Redis"; version: string; status: "running" | "stopped" | "restarting"; usedGb: number; sizeGb: number; connections: number; maxConnections: number; host: string; port: number }
export interface FileNode { name: string; type: "file" | "folder"; size?: number; modified?: string; content?: string; children?: FileNode[] }
export interface Activity { id: string; kind: "deploy" | "alert" | "security" | "error" | "backup"; text: string; at: string }
export interface Backup { id: string; target: string; kind: "database" | "project"; sizeGb: number; status: "completed" | "failed" | "running"; at: string; location: string }
export interface Schedule { id: string; name: string; cron: string; target: string; retention: number; enabled: boolean }
export interface CronJob { id: string; name: string; schedule: string; command: string; server: string; lastRun: string; lastStatus: "success" | "failed"; enabled: boolean }
export interface Worker { id: string; name: string; queue: string; concurrency: number; processed: number; failed: number; status: "running" | "degraded" | "stopped"; server: string }
export interface Bucket { id: string; name: string; region: string; objects: number; usedGb: number; public: boolean }
export interface ApiKey { id: string; name: string; prefix: string; secret: string; scopes: string[]; created: string; lastUsed: string }
export interface Endpoint { id: string; method: "GET" | "POST" | "PUT" | "DELETE"; path: string; project: string; rpm: number; p95: number; errorRate: number }
export interface Session { id: string; device: string; ip: string; location: string; lastActive: string; current?: boolean }
export interface LoginEvent { id: string; user: string; ip: string; location: string; at: string; ok: boolean }
export interface FirewallRule { id: string; action: "allow" | "deny"; port: string; protocol: "TCP" | "UDP"; source: string; note: string }
export interface AuditEvent { id: string; actor: string; action: string; target: string; at: string }
export interface Vulnerability { id: string; pkg: string; severity: "high" | "medium" | "low"; cve: string; server: string; fix: string }
export interface Secret { id: string; key: string; value: string; project: string; updated: string }
export interface Notification { id: string; level: "error" | "warning" | "success" | "info"; title: string; body: string; at: string; read: boolean; category: "deployment" | "server" | "database" }
export interface Plugin { id: string; name: string; description: string; version: string; developer: string; installed: boolean; icon: string }
export type StepStatus = "waiting" | "running" | "completed" | "failed";
export interface PipelineStep { name: string; status: StepStatus; sec: number }
export interface LogLine { id: number; ts: string; level: "info" | "warn" | "error" | "debug"; msg: string }
