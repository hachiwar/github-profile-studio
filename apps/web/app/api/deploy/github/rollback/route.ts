import { NextRequest, NextResponse } from "next/server";
import { createRollbackPlan } from "@gps/github";

const cookieName = "gps_github_token";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username : "new-developer";
  const repository = typeof body.repository === "string" ? body.repository : username;
  const rollbackLabel = typeof body.rollbackLabel === "string" ? body.rollbackLabel : `manual-${new Date().toISOString()}`;
  return NextResponse.json(
    createRollbackPlan({
      username,
      repository,
      rollbackLabel,
      authenticated: Boolean(request.cookies.get(cookieName)?.value)
    })
  );
}
