import { NextRequest, NextResponse } from "next/server";
import { createPagesEnablementPlan } from "@gps/github";

const cookieName = "gps_github_token";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username : "new-developer";
  return NextResponse.json(
    createPagesEnablementPlan({
      username,
      branch: typeof body.branch === "string" ? body.branch : "main",
      path: typeof body.path === "string" ? body.path : "/",
      authenticated: Boolean(request.cookies.get(cookieName)?.value)
    })
  );
}
