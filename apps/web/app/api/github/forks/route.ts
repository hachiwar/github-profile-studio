import { NextRequest, NextResponse } from "next/server";
import { calculateGrowthSummary, calculateRepositoryRankings } from "@gps/github";
import { githubDataErrorResponse, loadGitHubDataset } from "../_shared";

export async function GET(request: NextRequest) {
  try {
    const { username, result } = await loadGitHubDataset(request);
    const growth = calculateGrowthSummary(result.dataset.repositories, result.dataset.repositoryTrends);
    const rankings = calculateRepositoryRankings(result.dataset.repositories, result.dataset.repositoryTrends);
    return NextResponse.json({
      username,
      totalForks: result.dataset.totalForks,
      repositories: growth.forksByRepo,
      growth: growth.forkGrowth,
      topForked: rankings.topForked,
      cache: result.cache,
      rateLimit: result.rateLimit,
      warnings: result.warnings,
      fetchedAt: result.dataset.fetchedAt
    });
  } catch (error) {
    return githubDataErrorResponse(error);
  }
}
