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
      totalStars: result.dataset.totalStars,
      repositories: growth.starsByRepo,
      growth: growth.starGrowth,
      topStarred: rankings.topStarred,
      cache: result.cache,
      rateLimit: result.rateLimit,
      warnings: result.warnings,
      fetchedAt: result.dataset.fetchedAt
    });
  } catch (error) {
    return githubDataErrorResponse(error);
  }
}
