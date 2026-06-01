import { NextRequest, NextResponse } from "next/server";
import { githubDataErrorResponse, loadGitHubDataset } from "../_shared";

export async function GET(request: NextRequest) {
  try {
    const { username, result } = await loadGitHubDataset(request);
    return NextResponse.json({
      username,
      contributions: result.dataset.contributions,
      heatmap: result.dataset.contributions.contributionDays,
      cache: result.cache,
      rateLimit: result.rateLimit,
      warnings: result.warnings,
      fetchedAt: result.dataset.fetchedAt
    });
  } catch (error) {
    return githubDataErrorResponse(error);
  }
}
