import { describe, expect, it } from "vitest";
import { formatDate, timeAgo } from "@/components/helm/ui";

const now = new Date("2026-11-20T22:00:00Z").getTime();
describe("timestamps", () => {
  it("shows minutes ago", () => expect(timeAgo(new Date(now - 5 * 60_000).toISOString(), now)).toBe("5 minutes ago"));
  it("formats readable dates", () => expect(formatDate("2026-11-20T12:00:00Z")).toBe("Nov 20, 2026"));
  it("handles missing/invalid", () => { expect(timeAgo(undefined, now)).toBe("—"); expect(timeAgo("nope", now)).toBe("—"); expect(timeAgo(0, now)).toBe("—"); });
  it("never shows huge day counts", () => expect(timeAgo("2020-01-01T00:00:00Z", now)).toBe("Jan 1, 2020"));
  it("future dates shown as date", () => expect(timeAgo("2026-12-25T12:00:00Z", now)).toBe("Dec 25, 2026"));
});
