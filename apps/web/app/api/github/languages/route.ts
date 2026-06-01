import { NextRequest, NextResponse } from "next/server";
import { githubDataErrorResponse, loadGitHubDataset } from "../_shared";

export async function GET(request: NextRequest) {
  try {
    const { username, result } = await loadGitHubDataset(request);
    return NextResponse.json({
      username,
      languages: result.dataset.languages,
      technologyTags: result.dataset.technologyTags,
      repositories: result.dataset.repositories
        .filter((repo) => repo.language || repo.languages)
        .map((repo) => ({ fullName: repo.fullName, language: repo.language, languages: repo.languages ?? {}, stars: repo.stars, forks: repo.forks })),
      cache: result.cache,
      rateLimit: result.rateLimit,
      warnings: result.warnings,
      fetchedAt: result.dataset.fetchedAt
    });
  } catch (error) {
    return githubDataErrorResponse(error);
  }
}
