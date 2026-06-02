import { describe, expect, it } from "vitest";
import { demoGitHubDataset } from "@gps/core";
import { achievementCategories, buildAchievementEmbeds, calculateAchievements, defaultAchievementRules } from "./index";

describe("calculateAchievements", () => {
  it("calculates unlock state and progress", () => {
    const achievements = calculateAchievements(demoGitHubDataset("octocat"));
    expect(achievements.some((item) => item.unlocked)).toBe(true);
    expect(achievements[0].readmeBadgeMarkdown).toContain("img.shields.io");
  });

  it("includes required built-in achievement names", () => {
    const names = new Set(defaultAchievementRules.map((item) => item.name.en));
    for (const required of ["Daily Coder", "Monthly Grinder", "Star Legend", "Viral Repo", "PR Hero", "Bug Hunter", "Maintainer", "Release Publisher", "Topic Organizer"]) {
      expect(names.has(required)).toBe(true);
    }
  });

  it("covers required achievement categories", () => {
    const categories = achievementCategories();
    for (const required of ["contribution", "star", "fork", "pull-request", "issue", "language", "repository", "continuous-activity", "community-collaboration", "time-tenure", "growth-trend", "hidden", "quarterly", "annual"]) {
      expect(categories).toContain(required);
    }
  });

  it("builds share and embed outputs", () => {
    const embeds = buildAchievementEmbeds("octocat", "en-US", "https://studio.example");
    expect(embeds.readmeMarkdown).toContain("/api/cards/achievements");
    expect(embeds.pagesHtml).toContain("<img");
    expect(embeds.shareUrl).toContain("/achievements?username=octocat");
    expect(embeds.jsonUrl).toContain("/api/achievements/calculate");
  });
});
