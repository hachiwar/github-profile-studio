import { NextRequest, NextResponse } from "next/server";
import { decryptToken, GitHubClient, minimumOAuthScopes } from "@gps/github";

const cookieName = "gps_github_token";

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(cookieName);
  const token = readToken(request);
  const account = token ? await loadAccount(token).catch((error) => ({ error: error instanceof Error ? error.message : "GITHUB_ACCOUNT_LOAD_FAILED" })) : undefined;
  return NextResponse.json({
    authenticated: Boolean(cookie?.value),
    provider: "github",
    tokenStored: Boolean(cookie?.value),
    scopes: minimumOAuthScopes,
    capabilities: cookie?.value
      ? ["create-repository", "commit-files", "create-pull-request", "enable-pages", "write-workflows", "rollback"]
      : ["generate", "copy", "download", "public-card-api"],
    account
  });
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

async function loadAccount(token: string) {
  const client = new GitHubClient(token);
  const [profile, repositories] = await Promise.all([
    client.getAuthenticatedUser(),
    client.listAuthenticatedRepositories()
  ]);
  return {
    profile,
    repositories: repositories.map((repo) => ({
      fullName: repo.fullName,
      private: repo.isPrivate,
      visibility: repo.visibility,
      defaultBranch: repo.defaultBranch,
      updatedAt: repo.updatedAt
    }))
  };
}
