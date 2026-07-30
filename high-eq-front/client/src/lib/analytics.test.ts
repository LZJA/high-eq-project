import { beforeEach, describe, expect, it, vi } from "vitest";
import { analytics } from "./analytics";
import apiClient from "./api";

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.stubGlobal("localStorage", {
    getItem: vi.fn((key: string) => storage.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
    removeItem: vi.fn((key: string) => storage.delete(key)),
  });
  vi.stubGlobal("crypto", {
    randomUUID: vi.fn(() => "guest-id-1"),
  });
});

describe("analytics", () => {
  it("does not create or send a guest id for authenticated upgrade clicks", async () => {
    storage.set("access_token", "user-token");
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({ data: null });

    await analytics.trackUpgradeClick("pro");

    expect(post).toHaveBeenCalledWith("/analytics/upgrade-click", { targetTier: "pro" }, undefined);
    expect(storage.has("high-eq-guest-id")).toBe(false);
  });

  it("sends the stable guest id for anonymous upgrade clicks", async () => {
    vi.stubGlobal("window", {
      localStorage: globalThis.localStorage,
      crypto: globalThis.crypto,
    });
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({ data: null });

    await analytics.trackUpgradeClick("lite");

    expect(post).toHaveBeenCalledWith("/analytics/upgrade-click", { targetTier: "lite" }, {
      headers: { "X-Guest-Id": "guest-id-1" },
    });
    expect(storage.get("high-eq-guest-id")).toBe("guest-id-1");
  });
});
