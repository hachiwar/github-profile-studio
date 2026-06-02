import { NextRequest, NextResponse } from "next/server";
import { minimumOAuthScopes } from "@gps/github";

const cookieName = "gps_github_token";

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(cookieName);
  return NextResponse.json({
    authenticated: Boolean(cookie?.value),
    provider: "github",
    tokenStored: Boolean(cookie?.value),
    scopes: minimumOAuthScopes,
    capabilities: cookie?.value
      ? ["create-repository", "commit-files", "create-pull-request", "enable-pages", "write-workflows", "rollback"]
      : ["generate", "copy", "download", "public-card-api"]
  });
}
