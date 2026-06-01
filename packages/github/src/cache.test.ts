import { describe, expect, it } from "vitest";
import { cached, clearGitHubCache } from "./cache";

describe("github cache", () => {
  it("returns memory hits inside the freshness window", async () => {
    clearGitHubCache("test:fresh");
    let calls = 0;
    const first = await cached({
      key: "test:fresh",
      ttlSeconds: 60,
      loader: async () => {
        calls += 1;
        return { value: calls };
      }
    });
    const second = await cached({
      key: "test:fresh",
      ttlSeconds: 60,
      loader: async () => {
        calls += 1;
        return { value: calls };
      }
    });

    expect(first.cache.status).toBe("miss");
    expect(second.cache.status).toBe("hit");
    expect(second.value.value).toBe(1);
  });

  it("uses a stale cache entry when refresh fails", async () => {
    clearGitHubCache("test:stale");
    await cached({
      key: "test:stale",
      ttlSeconds: -1,
      staleSeconds: 60,
      loader: async () => "cached-value"
    });

    const stale = await cached({
      key: "test:stale",
      ttlSeconds: 10,
      staleSeconds: 60,
      loader: async () => {
        throw new Error("GITHUB_RATE_LIMIT");
      }
    });

    expect(stale.value).toBe("cached-value");
    expect(stale.cache.status).toBe("stale");
    expect(stale.cache.degraded).toBe(true);
  });

  it("does not fallback when the caller rejects the error class", async () => {
    clearGitHubCache("test:block");
    await expect(
      cached({
        key: "test:block",
        ttlSeconds: 60,
        loader: async () => {
          const error = new Error("not found") as Error & { status: number };
          error.status = 404;
          throw error;
        },
        fallback: () => "fallback",
        shouldFallback: (error) => (error as { status?: number }).status !== 404
      })
    ).rejects.toThrow("not found");
  });
});
