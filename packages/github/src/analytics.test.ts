import { describe, expect, it } from "vitest";
import type { GitHubDataset, Repository, UserProfile } from "@gps/core";
import { analyzeGitHubDataset, calculateRepositoryFieldCoverage, detectTechnologyStack } from "./analytics";
import { buildDatasetFromPublicData } from "./stats";

const repositories: Repository[] = [
  {
    githubRepoId: 1,
    owner: "octocat",
    name: "profile-studio",
    fullName: "octocat/profile-studio",
    description: "Next.js automation dashboard with PostgreSQL, Redis, and GitHub Actions.",
    homepage: "https://example.com",
    language: "TypeScript",
    languages: { TypeScript: 1200, CSS: 300 },
    topics: ["nextjs", "tailwind", "postgresql", "redis", "github-actions", "playwright"],
    stars: 60,
    forks: 12,
    watchers: 60,
    subscribers: 9,
    openIssues: 4,
    size: 1024,
    defaultBranch: "main",
    isFork: false,
    isArchived: false,
    isPrivate: false,
    isTemplate: true,
    visibility: "public",
    hasPages: true,
    hasWiki: true,
    hasDiscussions: true,
    contributors: 8,
    readmeSummary: "React Next.js TypeScript dashboard with Prisma PostgreSQL, Redis, Docker, Playwright and GitHub Actions.",
    releaseCount: 3,
    latestReleaseAt: "2026-05-15T00:00:00.000Z",
    releaseDownloads: 140,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2026-05-16T00:00:00.000Z",
    pushedAt: "2026-05-20T00:00:00.000Z"
  },
  {
    githubRepoId: 2,
    owner: "octocat",
    name: "api-kit",
    fullName: "octocat/api-kit",
    description: "API toolkit",
    homepage: "https://api.example.com",
    language: "Python",
    languages: { Python: 900 },
    topics: ["fastapi", "pytest", "aws"],
    stars: 20,
    forks: 8,
    watchers: 20,
    subscribers: 4,
    openIssues: 1,
    size: 512,
    defaultBranch: "main",
    isFork: false,
    isArchived: false,
    isPrivate: false,
    isTemplate: false,
    visibility: "public",
    hasPages: false,
    hasWiki: false,
    hasDiscussions: false,
    contributors: 3,
    readmeSummary: "FastAPI backend deployed to AWS with pytest coverage.",
    releaseCount: 1,
    latestReleaseAt: "2026-03-10T00:00:00.000Z",
    releaseDownloads: 30,
    createdAt: "2024-03-01T00:00:00.000Z",
    updatedAt: "2026-04-12T00:00:00.000Z",
    pushedAt: "2026-04-15T00:00:00.000Z"
  }
];

const profile: UserProfile = {
  githubUsername: "octocat",
  displayName: "Octocat",
  followers: 25,
  following: 5,
  publicRepos: 2,
  publicGists: 1,
  createdAt: "2020-01-01T00:00:00.000Z"
};

function dataset(): GitHubDataset {
  const base = buildDatasetFromPublicData({ profile, repositories, year: 2026 });
  return {
    ...base,
    repositoryTrends: [
      { repoFullName: "octocat/profile-studio", date: "2026-04-01", stars: 40, forks: 8, issues: 5, watchers: 40, subscribers: 7, contributors: 6, releaseDownloads: 100, snapshotSource: "scheduled-snapshot" },
      { repoFullName: "octocat/profile-studio", date: "2026-06-01", stars: 60, forks: 12, issues: 4, watchers: 60, subscribers: 9, contributors: 8, releaseDownloads: 140, snapshotSource: "scheduled-snapshot" },
      { repoFullName: "octocat/api-kit", date: "2026-04-01", stars: 10, forks: 5, issues: 2, watchers: 10, subscribers: 3, contributors: 2, releaseDownloads: 20, snapshotSource: "scheduled-snapshot" },
      { repoFullName: "octocat/api-kit", date: "2026-06-01", stars: 20, forks: 8, issues: 1, watchers: 20, subscribers: 4, contributors: 3, releaseDownloads: 30, snapshotSource: "scheduled-snapshot" }
    ],
    totalStars: 80,
    totalForks: 20
  };
}

describe("github analytics", () => {
  it("reports complete repository list and field coverage", () => {
    const coverage = calculateRepositoryFieldCoverage(dataset());

    expect(coverage.listComplete).toBe(true);
    expect(coverage.requiredFields.createdUpdatedPushedSizeDefaultBranch).toBe(true);
    expect(coverage.requiredFields.archivedForkTemplateVisibility).toBe(true);
    expect(coverage.requiredFields.releases).toBe(true);
    expect(coverage.watcherSemantics.starsUseStargazersCount).toBe(true);
    expect(coverage.watcherSemantics.trueWatchersUseSubscribersCount).toBe(true);
  });

  it("builds contribution, star, fork, PR, issue, release, and impact analytics", () => {
    const analytics = analyzeGitHubDataset(dataset());

    expect(analytics.contributionStats.currentStreak).toBeGreaterThanOrEqual(0);
    expect(Object.keys(analytics.contributionStats.monthly)).toContain("Apr");
    expect(Object.keys(analytics.contributionStats.weekly)).toContain("Mon");
    expect(Object.keys(analytics.contributionStats.hourly).length).toBeGreaterThan(0);
    expect(analytics.starStats.total).toBe(80);
    expect(analytics.starStats.repositoryCurves[0].points.length).toBe(2);
    expect(analytics.starStats.userCurve.at(-1)?.value).toBe(80);
    expect(analytics.forkStats.total).toBe(20);
    expect(analytics.forkStats.userCurve.at(-1)?.value).toBe(20);
    expect(analytics.pullRequests.mergeRate).toBeGreaterThanOrEqual(0);
    expect(analytics.issues.closeRate).toBeGreaterThanOrEqual(0);
    expect(analytics.releaseStats.repositoriesWithReleases).toBe(2);
    expect(analytics.communityImpact.score).toBeGreaterThan(0);
  });

  it("detects technology stack from topics, README summaries, and language/package signals", () => {
    const technology = detectTechnologyStack(repositories, ["TypeScript", "React", "Prisma"]);

    expect(technology.topics).toContain("nextjs");
    expect(technology.readmeSignals).toEqual(expect.arrayContaining(["React", "Next.js", "TypeScript"]));
    expect(technology.packageSignals).toEqual(expect.arrayContaining(["TypeScript", "Python"]));
    expect(technology.categories.frontend).toEqual(expect.arrayContaining(["React", "nextjs", "tailwind"]));
    expect(technology.categories.backend).toEqual(expect.arrayContaining(["fastapi"]));
    expect(technology.categories.database).toEqual(expect.arrayContaining(["Prisma", "postgresql", "redis"]));
    expect(technology.categories.devops).toEqual(expect.arrayContaining(["github-actions"]));
    expect(technology.categories.testing).toEqual(expect.arrayContaining(["playwright", "pytest"]));
    expect(technology.categories.cloud).toEqual(expect.arrayContaining(["aws"]));
  });
});
