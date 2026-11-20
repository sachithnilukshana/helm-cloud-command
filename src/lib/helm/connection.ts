import { useSyncExternalStore } from "react";
import { DEMO_MODE } from "./api";

/**
 * Backend connection state for the future HELM Agent (REST + WebSocket).
 * "connected" must only be set after an authenticated agent response, never by demo data.
 */
export type ConnectionState = "demo" | "connecting" | "connected" | "disconnected" | "error";

export const connectionLabel: Record<ConnectionState, string> = {
  demo: "Demo mode", connecting: "Connecting", connected: "Connected", disconnected: "Disconnected", error: "Error",
};

let state: ConnectionState = DEMO_MODE ? "demo" : "disconnected";
let lastRealUpdate: number | null = null;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

export function setConnectionState(next: ConnectionState) {
  if (DEMO_MODE) return; // demo data can never claim a live connection
  state = next; emit();
}
/** Call only when real data from the agent was received. */
export function markRealDataReceived() {
  if (DEMO_MODE) return;
  lastRealUpdate = Date.now(); state = "connected"; emit();
}
export const getConnectionState = () => state;

export const useConnectionState = () => useSyncExternalStore(subscribe, () => state, () => state);
export const useLastRealUpdate = () => useSyncExternalStore(subscribe, () => lastRealUpdate, () => lastRealUpdate);
