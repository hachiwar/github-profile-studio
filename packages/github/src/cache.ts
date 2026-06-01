export type CacheStatus = "hit" | "miss" | "stale" | "fallback";

export type CacheMeta = {
  key: string;
  status: CacheStatus;
  source: "github-api" | "memory-cache" | "stale-cache" | "fallback";
  stale: boolean;
  degraded: boolean;
  ttlSeconds: number;
  generatedAt: string;
  expiresAt: string;
  staleUntil: string;
  reason?: string;
};

export type CacheOptions<T> = {
  key: string;
  ttlSeconds: number;
  staleSeconds?: number;
  forceRefresh?: boolean;
  loader: () => Promise<T>;
  fallback?: () => T | Promise<T>;
  shouldFallback?: (error: unknown) => boolean;
};

type CacheEntry<T> = {
  value: T;
  generatedAt: number;
  expiresAt: number;
  staleUntil: number;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

export async function cached<T>(options: CacheOptions<T>): Promise<{ value: T; cache: CacheMeta }> {
  const now = Date.now();
  const staleSeconds = options.staleSeconds ?? options.ttlSeconds * 4;
  const existing = memoryCache.get(options.key) as CacheEntry<T> | undefined;

  if (existing && !options.forceRefresh && existing.expiresAt > now) {
    return {
      value: existing.value,
      cache: buildCacheMeta(options.key, "hit", "memory-cache", false, false, options.ttlSeconds, existing)
    };
  }

  try {
    const value = await options.loader();
    const entry: CacheEntry<T> = {
      value,
      generatedAt: now,
      expiresAt: now + options.ttlSeconds * 1000,
      staleUntil: now + staleSeconds * 1000
    };
    memoryCache.set(options.key, entry);
    return {
      value,
      cache: buildCacheMeta(options.key, "miss", "github-api", false, false, options.ttlSeconds, entry)
    };
  } catch (error) {
    if (existing && existing.staleUntil > now) {
      return {
        value: existing.value,
        cache: buildCacheMeta(options.key, "stale", "stale-cache", true, true, options.ttlSeconds, existing, errorToReason(error))
      };
    }

    if (options.fallback && (options.shouldFallback?.(error) ?? true)) {
      const value = await options.fallback();
      const entry: CacheEntry<T> = {
        value,
        generatedAt: now,
        expiresAt: now + Math.min(options.ttlSeconds, 60) * 1000,
        staleUntil: now + staleSeconds * 1000
      };
      return {
        value,
        cache: buildCacheMeta(options.key, "fallback", "fallback", true, true, options.ttlSeconds, entry, errorToReason(error))
      };
    }

    throw error;
  }
}

export function clearGitHubCache(prefix?: string): number {
  let deleted = 0;
  for (const key of memoryCache.keys()) {
    if (!prefix || key.startsWith(prefix)) {
      memoryCache.delete(key);
      deleted += 1;
    }
  }
  return deleted;
}

export function getGitHubCacheSnapshot(): Array<{ key: string; generatedAt: string; expiresAt: string; staleUntil: string }> {
  return [...memoryCache.entries()].map(([key, entry]) => ({
    key,
    generatedAt: new Date(entry.generatedAt).toISOString(),
    expiresAt: new Date(entry.expiresAt).toISOString(),
    staleUntil: new Date(entry.staleUntil).toISOString()
  }));
}

function buildCacheMeta(
  key: string,
  status: CacheStatus,
  source: CacheMeta["source"],
  stale: boolean,
  degraded: boolean,
  ttlSeconds: number,
  entry: CacheEntry<unknown>,
  reason?: string
): CacheMeta {
  return {
    key,
    status,
    source,
    stale,
    degraded,
    ttlSeconds,
    generatedAt: new Date(entry.generatedAt).toISOString(),
    expiresAt: new Date(entry.expiresAt).toISOString(),
    staleUntil: new Date(entry.staleUntil).toISOString(),
    reason
  };
}

export function errorToReason(error: unknown): string {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: number }).status;
    if (status === 403) return "GITHUB_RATE_LIMIT_OR_FORBIDDEN";
    if (status === 404) return "GITHUB_RESOURCE_NOT_FOUND";
    if (status === 401) return "GITHUB_TOKEN_INVALID_OR_EXPIRED";
    if (typeof status === "number") return `GITHUB_API_${status}`;
  }
  return error instanceof Error ? error.message : "GITHUB_API_FAILED";
}
