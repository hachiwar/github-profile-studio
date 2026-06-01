import { NextRequest, NextResponse } from "next/server";
import { studioErrors } from "@gps/core";
import { GitHubClient, parseGitHubInput } from "@gps/github";

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get("input") ?? request.nextUrl.searchParams.get("username") ?? "";
  let username: string;
  try {
    const parsed = parseGitHubInput(input);
    username = parsed.username;
  } catch {
    return NextResponse.json({ error: studioErrors.USERNAME_INVALID }, { status: 400 });
  }

  try {
    const client = new GitHubClient(process.env.GITHUB_TOKEN);
    return NextResponse.json(await client.detect(username));
  } catch (error) {
    return NextResponse.json({ error: mapGitHubError(error) }, { status: 502 });
  }
}

function mapGitHubError(error: unknown) {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: number }).status;
    if (status === 403) return studioErrors.GITHUB_RATE_LIMITED;
    if (status === 404) return studioErrors.GITHUB_USER_NOT_FOUND;
  }
  return studioErrors.NETWORK_FAILED;
}

