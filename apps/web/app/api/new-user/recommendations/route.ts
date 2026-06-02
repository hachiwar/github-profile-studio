import { NextRequest, NextResponse } from "next/server";
import { buildNewUserRecommendations, defaultNewUserFormDraft, recommendNewUserMode } from "@gps/core";

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
  const draft = body.draft ? body.draft : defaultNewUserFormDraft(typeof body.username === "string" ? body.username : "new-developer", body.locale === "zh-CN" || body.locale === "bilingual" ? body.locale : "en-US");
  return NextResponse.json({
    ...recommendation,
    profileRecommendations: buildNewUserRecommendations(draft),
    acceptanceIds: ["N-REC-001", "N-REC-002", "N-REC-003", "N-REC-004", "N-REC-005", "N-REC-006", "N-REC-007", "N-REC-008"]
  });
}
