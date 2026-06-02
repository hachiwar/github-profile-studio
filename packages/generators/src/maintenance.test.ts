import { describe, expect, it } from "vitest";
import { demoProfileConfig } from "@gps/core";
import {
  createMaintenanceRun,
  createRepositorySnapshots,
  createStarHistoryBackfill,
  generateGrowthRecommendations,
  generateMonthlyGrowthSummary,
  generateYearInReview
} from "./maintenance";

describe("maintenance generators", () => {
  const config = demoProfileConfig("octocat", "en-US");
  const dataset = config.github!;

  it("creates star and fork snapshots from repository trends", () => {
    const snapshots = createRepositorySnapshots(dataset, "2026-06-02");
    expect(snapshots.filter((item) => item.kind === "star")).toHaveLength(dataset.repositoryTrends.length);
    expect(snapshots.filter((item) => item.kind === "fork")).toHaveLength(dataset.repositoryTrends.length);
    expect(snapshots[0]).toMatchObject({ username: "octocat", date: "2026-06-02" });
  });

  it("creates best-effort star history before scheduled snapshots", () => {
    const history = createStarHistoryBackfill(dataset, "2026-06-02");
    expect(history.some((point) => point.source === "repository-created-at" && point.stars === 0)).toBe(true);
    expect(history.some((point) => point.source === "scheduled-snapshot" && point.stars === dataset.repositories[0].stars)).toBe(true);
  });

  it("generates monthly and annual growth summaries", () => {
    const previous = {
      ...dataset,
      totalStars: dataset.totalStars - 5,
      totalForks: dataset.totalForks - 2,
      contributions: {
        ...dataset.contributions,
        totalContributions: dataset.contributions.totalContributions - 20
      }
    };
    const monthly = generateMonthlyGrowthSummary(dataset, previous);
    const annual = generateYearInReview(dataset, 2026);

    expect(monthly.delta).toMatchObject({ contributions: 20, stars: 5, forks: 2 });
    expect(monthly.topLanguages).toContain("TypeScript");
    expect(annual.markdown).toContain("2026 GitHub Year in Review");
    expect(annual.totals.contributions).toBe(dataset.contributions.totalContributions);
  });

  it("covers every required growth recommendation acceptance item", () => {
    const recommendations = generateGrowthRecommendations(dataset, config);
    expect(recommendations).toHaveLength(10);
    expect(recommendations.map((item) => item.acceptanceId)).toEqual([
      "N-GROW-001",
      "N-GROW-002",
      "N-GROW-003",
      "N-GROW-004",
      "N-GROW-005",
      "N-GROW-006",
      "N-GROW-007",
      "N-GROW-008",
      "N-GROW-009",
      "N-GROW-010"
    ]);
  });

  it("creates a full maintenance run with files for automation acceptance", () => {
    const run = createMaintenanceRun({
      config,
      modules: [
        "readme",
        "pages-data",
        "star-snapshot",
        "fork-snapshot",
        "contributions",
        "blog-rss",
        "achievements",
        "year-in-review",
        "card-cache",
        "project-ranking",
        "error-notification"
      ],
      generatedAt: "2026-06-02T00:00:00.000Z"
    });

    const paths = run.files.map((item) => item.path);
    expect(paths).toContain("README.md");
    expect(paths).toContain("data/github.json");
    expect(paths).toContain("data/star-snapshots.json");
    expect(paths).toContain("data/star-history-backfill.json");
    expect(paths).toContain("data/fork-snapshots.json");
    expect(paths).toContain("data/achievements.json");
    expect(paths).toContain("data/project-ranking.json");
    expect(paths).toContain(".github/workflows/profile-studio-update.yml");
    expect(run.summary.acceptanceIds).toEqual(
      expect.arrayContaining(["03-017", "11-001", "11-002", "11-003", "11-004", "11-005", "11-007", "N-GROW-010"])
    );
    expect(run.recommendations).toHaveLength(10);
  });
});
