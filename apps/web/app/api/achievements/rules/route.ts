import { NextResponse } from "next/server";
import { achievementCategories, defaultAchievementRules } from "@gps/achievements";

export function GET() {
  return NextResponse.json({
    categories: achievementCategories(defaultAchievementRules),
    rules: defaultAchievementRules.map(({ evaluate: _evaluate, ...rule }) => rule)
  });
}
