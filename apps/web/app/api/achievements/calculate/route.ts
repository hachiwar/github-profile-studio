import { NextRequest, NextResponse } from "next/server";
import { demoGitHubDataset } from "@gps/core";
import { achievementCategories, calculateAchievements, defaultAchievementRules } from "@gps/achievements";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username : "octocat";
  const locale = body.locale === "zh-CN" || body.locale === "bilingual" ? body.locale : "en-US";
  const dataset = body.dataset ?? demoGitHubDataset(username);
  const achievements = calculateAchievements(dataset, defaultAchievementRules, locale);

  return NextResponse.json({
    categories: achievementCategories(defaultAchievementRules),
    totalScore: achievements.filter((item) => item.unlocked).reduce((total, item) => total + item.score, 0),
    achievements
  });
}

