import { describe, expect, it } from "vitest";
import { demoGitHubDataset } from "@gps/core";
import { calculateAchievements } from "./index";

describe("calculateAchievements", () => {
  it("calculates unlock state and progress", () => {
    const achievements = calculateAchievements(demoGitHubDataset("octocat"));
    expect(achievements.some((item) => item.unlocked)).toBe(true);
    expect(achievements[0].readmeBadgeMarkdown).toContain("img.shields.io");
  });
});

