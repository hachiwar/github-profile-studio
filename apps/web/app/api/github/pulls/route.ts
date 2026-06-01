import { NextRequest, NextResponse } from "next/server";
import { githubDataErrorResponse, loadGitHubDataset } from "../_shared";

export async function GET(request: NextRequest) {
  try {
    const { username, result } = await loadGitHubDataset(request);
    return NextResponse.json({
      username,
      pullRequests: result.dataset.pullRequests,
      collaborationRepositories: result.dataset.repositories
        .filter((repo) => repo.isFork || (repo.contributors ?? 0) > 1)
        .slice(0, 20)
        .map((repo) => ({ fullName: repo.fullName, contributors: repo.contributors ?? 0, language: repo.language, stars: repo.stars })),
      cache: result.cache,
      rateLimit: result.rateLimit,
      warnings: result.warnings,
      fetchedAt: result.dataset.fetchedAt
    });
  } catch (error) {
    return githubDataErrorResponse(error);
  }
}
