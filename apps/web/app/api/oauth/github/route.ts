import { NextRequest, NextResponse } from "next/server";
import { buildGitHubOAuthUrl, createOAuthState, minimumOAuthScopes } from "@gps/github";

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const origin = request.nextUrl.origin;
  const returnTo = request.nextUrl.searchParams.get("returnTo") ?? "/dashboard";
  const redirectUri = `${origin}/api/oauth/github/callback`;
  const state = createOAuthState(returnTo);

  if (!clientId) {
    return NextResponse.json(
      {
        configured: false,
        error: "GITHUB_CLIENT_ID_MISSING",
        scopes: minimumOAuthScopes,
        setup: ["Create a GitHub OAuth app.", "Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.", "Set callback URL to /api/oauth/github/callback."]
      },
      { status: 501 }
    );
  }

  const authorizationUrl = buildGitHubOAuthUrl({ clientId, redirectUri, state });
  if (request.nextUrl.searchParams.get("format") === "json") {
    return NextResponse.json({ configured: true, authorizationUrl, state, scopes: minimumOAuthScopes });
  }
  return NextResponse.redirect(authorizationUrl);
}
