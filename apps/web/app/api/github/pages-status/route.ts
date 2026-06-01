import { NextRequest, NextResponse } from "next/server";
import { studioErrors } from "@gps/core";
import { GitHubClient, parseGitHubInput } from "@gps/github";

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get("username") ?? "";
  try {
    const parsed = parseGitHubInput(input);
    const client = new GitHubClient(process.env.GITHUB_TOKEN);
    return NextResponse.json(await client.detectRepository(parsed.username, `${parsed.username}.github.io`));
  } catch (error) {
    const isInvalid = error instanceof Error && error.message === "USERNAME_INVALID";
    return NextResponse.json(
      { error: isInvalid ? studioErrors.USERNAME_INVALID : studioErrors.NETWORK_FAILED },
      { status: isInvalid ? 400 : 502 }
    );
  }
}

