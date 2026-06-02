import { NextRequest, NextResponse } from "next/server";
import { clearGitHubCache, getGitHubCacheSnapshot } from "@gps/github";

export async function GET() {
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    cache: getGitHubCacheSnapshot(),
    policy: {
      defaultTtlSeconds: 900,
      staleWhileRevalidateSeconds: 3600,
      degradation: "serve stale cache or deterministic fallback when GitHub API is unavailable"
    },
    acceptanceIds: ["03-014", "03-015", "16-002"]
  });
}

export async function DELETE(request: NextRequest) {
  const prefix = request.nextUrl.searchParams.get("prefix") ?? undefined;
  const deleted = clearGitHubCache(prefix);
  return NextResponse.json({ deleted, prefix: prefix ?? null, acceptanceIds: ["16-002"] });
}
