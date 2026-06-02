import { NextRequest, NextResponse } from "next/server";
import { createPagesEnablementPlan, decryptToken, GitHubClient } from "@gps/github";

const cookieName = "gps_github_token";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username : "new-developer";
  const branch = typeof body.branch === "string" ? body.branch : "main";
  const path = typeof body.path === "string" ? body.path : "/";
  const token = readToken(request);
  const preview = createPagesEnablementPlan({ username, branch, path, authenticated: Boolean(token) });
  if (body.live !== true || !token) return NextResponse.json(preview);
  try {
    const client = new GitHubClient(token);
    const url = await client.enablePagesForRepository(username, `${username}.github.io`, branch, path);
    return NextResponse.json({ ...preview, execution: { executed: true, pagesUrl: url } });
  } catch (error) {
    return NextResponse.json({ ...preview, execution: { executed: false, error: error instanceof Error ? error.message : "PAGES_ENABLE_FAILED" } }, { status: 502 });
  }
}

function readToken(request: NextRequest): string | undefined {
  const cookie = request.cookies.get(cookieName)?.value;
  const tokenKey = process.env.TOKEN_ENCRYPTION_KEY;
  if (!cookie || !tokenKey) return undefined;
  try {
    const encrypted = JSON.parse(Buffer.from(cookie, "base64url").toString("utf8"));
    return decryptToken(encrypted, tokenKey);
  } catch {
    return undefined;
  }
}
