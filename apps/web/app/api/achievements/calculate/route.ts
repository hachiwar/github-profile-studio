import { NextRequest, NextResponse } from "next/server";
import { demoGitHubDataset } from "@gps/core";
import { achievementCategories, buildAchievementEmbeds, calculateAchievements, defaultAchievementRules } from "@gps/achievements";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username") ?? "octocat";
  const localeParam = request.nextUrl.searchParams.get("locale");
  const locale = localeParam === "zh-CN" || localeParam === "bilingual" ? localeParam : "en-US";
  return achievementResponse(username, locale, demoGitHubDataset(username));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username : "octocat";
  const locale = body.locale === "zh-CN" || body.locale === "bilingual" ? body.locale : "en-US";
  const dataset = body.dataset ?? demoGitHubDataset(username);
  return achievementResponse(username, locale, dataset);
}

function achievementResponse(username: string, locale: "en-US" | "zh-CN" | "bilingual", dataset: ReturnType<typeof demoGitHubDataset>) {
  const achievements = calculateAchievements(dataset, defaultAchievementRules, locale);

  return NextResponse.json({
    categories: achievementCategories(defaultAchievementRules),
    totalScore: achievements.filter((item) => item.unlocked).reduce((total, item) => total + item.score, 0),
    achievements,
    embeds: buildAchievementEmbeds(username, locale, process.env.NEXT_PUBLIC_APP_URL),
    acceptanceIds: ["07-002", "07-003", "07-004", "07-006", "07-007"]
  });
}
