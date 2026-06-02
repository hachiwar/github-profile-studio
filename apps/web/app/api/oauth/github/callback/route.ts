import { NextRequest, NextResponse } from "next/server";
import { encryptToken, exchangeGitHubOAuthCode, parseOAuthState } from "@gps/github";

const cookieName = "gps_github_token";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const stateValue = request.nextUrl.searchParams.get("state");
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const tokenKey = process.env.TOKEN_ENCRYPTION_KEY;

  if (!code || !stateValue) return NextResponse.json({ error: "OAUTH_CALLBACK_INVALID" }, { status: 400 });
  if (!clientId || !clientSecret || !tokenKey) {
    return NextResponse.json({ error: "OAUTH_ENV_MISSING", required: ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET", "TOKEN_ENCRYPTION_KEY"] }, { status: 501 });
  }

  try {
    const state = parseOAuthState(stateValue);
    const token = await exchangeGitHubOAuthCode({
      clientId,
      clientSecret,
      code,
      redirectUri: `${request.nextUrl.origin}/api/oauth/github/callback`
    });
    const encrypted = encryptToken(token.access_token, tokenKey);
    const response = NextResponse.json({
      authenticated: true,
      returnTo: state.returnTo,
      tokenType: token.token_type,
      scopes: token.scope.split(/\s+/).filter(Boolean),
      tokenStored: true
    });
    response.cookies.set(cookieName, Buffer.from(JSON.stringify(encrypted), "utf8").toString("base64url"), {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/"
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "OAUTH_CALLBACK_FAILED" }, { status: 400 });
  }
}
