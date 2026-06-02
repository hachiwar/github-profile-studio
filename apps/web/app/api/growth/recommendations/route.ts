import { NextRequest, NextResponse } from "next/server";
import { demoProfileConfig, type StudioLocale } from "@gps/core";
import { generateGrowthRecommendations, generateMonthlyGrowthSummary, generateYearInReview, localizeRecommendation } from "@gps/generators";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username") ?? "new-developer";
  const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
  const config = demoProfileConfig(username, locale);
  const dataset = config.github!;
  const recommendations = generateGrowthRecommendations(dataset, config);

  return NextResponse.json({
    username,
    locale,
    recommendations,
    localized: recommendations.map((item) => localizeRecommendation(item, locale)),
    monthlySummary: generateMonthlyGrowthSummary(dataset),
    yearInReview: generateYearInReview(dataset),
    acceptanceIds: recommendations.map((item) => item.acceptanceId)
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const locale = parseLocale(typeof body.locale === "string" ? body.locale : undefined);
  const config = body.config && typeof body.config === "object" ? body.config : demoProfileConfig(typeof body.username === "string" ? body.username : "new-developer", locale);
  const dataset = body.dataset && typeof body.dataset === "object" ? body.dataset : config.github;
  const recommendations = generateGrowthRecommendations(dataset, config, body.previousDataset);

  return NextResponse.json({
    username: dataset.profile.githubUsername,
    locale,
    recommendations,
    localized: recommendations.map((item) => localizeRecommendation(item, locale)),
    monthlySummary: generateMonthlyGrowthSummary(dataset, body.previousDataset),
    yearInReview: generateYearInReview(dataset),
    acceptanceIds: recommendations.map((item) => item.acceptanceId)
  });
}

function parseLocale(value?: string | null): StudioLocale {
  if (value === "zh-CN" || value === "bilingual") return value;
  return "en-US";
}
