import { describe, expect, it } from "vitest";
import { demoGitHubDataset } from "@gps/core";
import { achievementCategories, calculateAchievements, defaultAchievementRules } from "./index";

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
});
