import { NextRequest, NextResponse } from "next/server";
import { analyzeGitHubDataset } from "@gps/github";
import { githubDataErrorResponse, loadGitHubDataset } from "../_shared";

export async function GET(request: NextRequest) {
  try {
    const { username, result } = await loadGitHubDataset(request);
    return NextResponse.json({
      username,
      analytics: analyzeGitHubDataset(result.dataset),
      dataset: {
        fetchedAt: result.dataset.fetchedAt,
        repositories: result.dataset.repositories.length,
        totalStars: result.dataset.totalStars,
        totalForks: result.dataset.totalForks
      },
      cache: result.cache,
      rateLimit: result.rateLimit,
      warnings: result.warnings,
      acceptanceIds: [
        "03-002",
        "03-004",
        "03-006",
        "03-007",
        "03-008",
        "03-011",
        "03-012",
        "03-013",
        "03-015",
        "03-016",
        "03-018",
        "03-019",
        "03-020",
        "03-021",
        "03-025",
        "03-026"
      ]
    });
  } catch (error) {
    return githubDataErrorResponse(error);
  }
}
