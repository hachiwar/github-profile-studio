import { NextRequest, NextResponse } from "next/server";
import { studioErrors } from "@gps/core";
import { GitHubClient, isGitHubNotFound, parseGitHubInput } from "@gps/github";

export async function loadGitHubDataset(request: NextRequest) {
  const input = request.nextUrl.searchParams.get("username") ?? request.nextUrl.searchParams.get("user") ?? "";
  const parsed = parseGitHubInput(input);
  const refresh = request.nextUrl.searchParams.get("refresh") === "true";
  const year = parseOptionalYear(request.nextUrl.searchParams.get("year"));
  const client = new GitHubClient(process.env.GITHUB_TOKEN);
  return {
    username: parsed.username,
    result: await client.getDataset(parsed.username, { forceRefresh: refresh, year })
  };
}

export function githubDataErrorResponse(error: unknown) {
  if (error instanceof Error && error.message === "USERNAME_INVALID") {
    return NextResponse.json({ error: studioErrors.USERNAME_INVALID }, { status: 400 });
  }
  if (isGitHubNotFound(error)) {
    return NextResponse.json({ error: studioErrors.GITHUB_USER_NOT_FOUND }, { status: 404 });
  }
  return NextResponse.json({ error: studioErrors.NETWORK_FAILED }, { status: 502 });
}

function parseOptionalYear(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(parsed) || parsed < 2008 || parsed > currentYear + 1) return undefined;
  return parsed;
}
