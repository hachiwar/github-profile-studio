import { NextRequest, NextResponse } from "next/server";
import { recommendNewUserMode } from "@gps/core";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const recommendation = recommendNewUserMode({
    username: typeof body.username === "string" ? body.username : "new-developer",
    publicRepos: Number(body.publicRepos ?? 0),
    totalContributions: Number(body.totalContributions ?? 0),
    totalStars: Number(body.totalStars ?? 0),
    pullRequests: Number(body.pullRequests ?? 0),
    issues: Number(body.issues ?? 0),
    hasContributionGraph: Boolean(body.hasContributionGraph)
  });
  return NextResponse.json(recommendation);
}

