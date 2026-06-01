import { NextRequest, NextResponse } from "next/server";
import { parseGitHubInput } from "@gps/github";
import { studioErrors } from "@gps/core";

export function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get("input") ?? "";
  try {
    return NextResponse.json(parseGitHubInput(input));
  } catch {
    return NextResponse.json({ error: studioErrors.USERNAME_INVALID }, { status: 400 });
  }
}

