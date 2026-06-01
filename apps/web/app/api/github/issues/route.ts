import { NextRequest, NextResponse } from "next/server";
import { githubDataErrorResponse, loadGitHubDataset } from "../_shared";

export async function GET(request: NextRequest) {
  try {
    const { username, result } = await loadGitHubDataset(request);
    return NextResponse.json({
      username,
      issues: result.dataset.issues,
      activeRepositories: result.dataset.repositories
        .filter((repo) => repo.openIssues > 0)
        .sort((a, b) => b.openIssues - a.openIssues)
        .slice(0, 20)
        .map((repo) => ({ fullName: repo.fullName, openIssues: repo.openIssues, language: repo.language, topics: repo.topics })),
      cache: result.cache,
      rateLimit: result.rateLimit,
      warnings: result.warnings,
      fetchedAt: result.dataset.fetchedAt
    });
  } catch (error) {
    return githubDataErrorResponse(error);
  }
}
