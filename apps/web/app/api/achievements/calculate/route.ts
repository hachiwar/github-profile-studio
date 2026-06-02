import { NextRequest, NextResponse } from "next/server";
import { demoGitHubDataset } from "@gps/core";
import { achievementCategories, buildAchievementEmbeds, calculateAchievements, defaultAchievementRules } from "@gps/achievements";
import { GitHubClient } from "@gps/github";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username") ?? "octocat";
  const localeParam = request.nextUrl.searchParams.get("locale");
  const locale = localeParam === "zh-CN" || localeParam === "bilingual" ? localeParam : "en-US";
  const result = await loadAchievementDataset(username);
  return achievementResponse(username, locale, result.dataset, result.source, result.warnings);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username : "octocat";
  const locale = body.locale === "zh-CN" || body.locale === "bilingual" ? body.locale : "en-US";
  const result = body.dataset ? { dataset: body.dataset, source: "request-body", warnings: [] } : await loadAchievementDataset(username);
  return achievementResponse(username, locale, result.dataset, result.source, result.warnings);
}

async function loadAchievementDataset(username: string) {
  try {
    const result = await new GitHubClient(process.env.GITHUB_TOKEN).getDataset(username);
    return { dataset: result.dataset, source: result.cache.source, warnings: result.warnings };
  } catch (error) {
    return {
      dataset: demoGitHubDataset(username),
      source: "fallback-demo",
      warnings: [error instanceof Error ? error.message : "ACHIEVEMENT_DATASET_FALLBACK"]
    };
  }
}

function achievementResponse(username: string, locale: "en-US" | "zh-CN" | "bilingual", dataset: ReturnType<typeof demoGitHubDataset>, source: string, warnings: string[]) {
  const achievements = calculateAchievements(dataset, defaultAchievementRules, locale);

  return NextResponse.json({
    username,
    source,
    warnings,
    categories: achievementCategories(defaultAchievementRules),
    totalScore: achievements.filter((item) => item.unlocked).reduce((total, item) => total + item.score, 0),
    achievements,
    embeds: buildAchievementEmbeds(username, locale, process.env.NEXT_PUBLIC_APP_URL),
    acceptanceIds: ["07-002", "07-003", "07-004", "07-006", "07-007"]
  });
}
