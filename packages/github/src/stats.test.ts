import { describe, expect, it } from "vitest";
import type { Repository, UserProfile } from "@gps/core";
import {
  buildCurrentRepositoryTrends,
  buildDatasetFromPublicData,
  calculateGrowthSummary,
  calculateLanguageStats,
  calculateRepositoryRankings,
  estimateContributionStats
} from "./stats";

const repositories: Repository[] = [
  {
    githubRepoId: 1,
    owner: "octocat",
    name: "alpha",
    fullName: "octocat/alpha",
    description: "Alpha",
    language: "TypeScript",
    languages: { TypeScript: 800, CSS: 200 },
    topics: ["nextjs", "automation"],
    stars: 30,
    forks: 5,
    watchers: 30,
    subscribers: 3,
    openIssues: 2,
    size: 100,
    defaultBranch: "main",
    isFork: false,
    isArchived: false,
    isPrivate: false,
    hasPages: true,
    hasWiki: false,
    hasDiscussions: true,
    contributors: 4,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    pushedAt: "2026-05-20T00:00:00.000Z"
  },
  {
    githubRepoId: 2,
    owner: "octocat",
    name: "beta",
    fullName: "octocat/beta",
    language: "Python",
    languages: { Python: 500 },
    topics: ["cli"],
    stars: 8,
    forks: 12,
    watchers: 8,
    subscribers: 1,
    openIssues: 0,
    size: 50,
    defaultBranch: "main",
    isFork: false,
    isArchived: false,
    isPrivate: false,
    hasPages: false,
    hasWiki: false,
    hasDiscussions: false,
    contributors: 2,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
    pushedAt: "2026-04-02T00:00:00.000Z"
  }
];

const profile: UserProfile = {
  githubUsername: "octocat",
  displayName: "Octocat",
  followers: 10,
  following: 3,
  publicRepos: 2,
  publicGists: 0
};

describe("github stats", () => {
  it("calculates language distributions across repo count, bytes, stars, and forks", () => {
    const stats = calculateLanguageStats(repositories);

    expect(stats.byRepoCount).toMatchObject({ TypeScript: 1, Python: 1 });
    expect(stats.byBytes).toMatchObject({ TypeScript: 800, Python: 500, CSS: 200 });
    expect(stats.starWeighted.TypeScript).toBe(30);
    expect(stats.forkWeighted.Python).toBe(12);
  });

  it("builds repository rankings and growth summaries", () => {
    const trends = buildCurrentRepositoryTrends(repositories, "2026-06-01");
    const rankings = calculateRepositoryRankings(repositories, trends);
    const growth = calculateGrowthSummary(repositories, trends);

    expect(rankings.topStarred[0].fullName).toBe("octocat/alpha");
    expect(rankings.topForked[0].fullName).toBe("octocat/beta");
    expect(growth.totalStars).toBe(38);
    expect(growth.totalForks).toBe(17);
  });

  it("builds a complete dataset from public repository data", () => {
    const dataset = buildDatasetFromPublicData({ profile, repositories, year: 2026 });

    expect(dataset.profile.githubUsername).toBe("octocat");
    expect(dataset.repositories).toHaveLength(2);
    expect(dataset.contributions.contributionDays.length).toBeGreaterThan(300);
    expect(dataset.technologyTags).toContain("TypeScript");
    expect(dataset.pullRequests.mergeRate).toBeGreaterThanOrEqual(0);
  });

  it("estimates contribution heatmap levels from repo activity", () => {
    const contributions = estimateContributionStats("octocat", repositories, profile, 2026);

    expect(contributions.totalContributions).toBeGreaterThan(0);
    expect(contributions.contributionDays.some((day) => day.level > 0)).toBe(true);
    expect(contributions.monthlyStats.May).toBeGreaterThan(0);
  });
});
