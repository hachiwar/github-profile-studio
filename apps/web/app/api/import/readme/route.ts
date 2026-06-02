import { NextRequest, NextResponse } from "next/server";
import { studioErrors } from "@gps/core";
import { importReadmeMarkdown } from "@gps/generators";
import { GitHubClient, isGitHubNotFound, parseGitHubInput } from "@gps/github";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const sourceType = typeof body.sourceType === "string" ? body.sourceType : "paste";
    const resolved = await resolveMarkdown(body, sourceType);

    return NextResponse.json({
      source: resolved.source,
      ...importReadmeMarkdown(resolved.markdown, sourceType as never)
    });
  } catch (error) {
    if (error instanceof Error && error.message === "USERNAME_INVALID") {
      return NextResponse.json({ error: studioErrors.USERNAME_INVALID }, { status: 400 });
    }
    if ((error instanceof Error && error.message === "README_NOT_FOUND") || isGitHubNotFound(error)) {
      return NextResponse.json({ error: studioErrors.README_NOT_FOUND }, { status: 404 });
    }
    return NextResponse.json({ error: studioErrors.NETWORK_FAILED }, { status: 502 });
  }
}

async function resolveMarkdown(body: Record<string, unknown>, sourceType: string): Promise<{ markdown: string; source: Record<string, unknown> }> {
  if (sourceType === "paste") {
    return { markdown: typeof body.markdown === "string" ? body.markdown : "", source: { type: "paste" } };
  }

  if (sourceType === "upload") {
    const markdown = typeof body.fileContent === "string" ? body.fileContent : typeof body.markdown === "string" ? body.markdown : "";
    return { markdown, source: { type: "upload", fileName: typeof body.fileName === "string" ? body.fileName : "README.md" } };
  }

  const token = typeof body.accessToken === "string" ? body.accessToken : process.env.GITHUB_TOKEN;
  const client = new GitHubClient(token);
  const ref = typeof body.ref === "string" ? body.ref : undefined;
  const ownerRepo = resolveOwnerRepo(body, sourceType);
  const readme = await client.getReadmeMarkdown(ownerRepo.owner, ownerRepo.repo, ref);
  return {
    markdown: readme.markdown,
    source: {
      type: sourceType,
      owner: ownerRepo.owner,
      repo: ownerRepo.repo,
      path: readme.path,
      sha: readme.sha,
      htmlUrl: readme.htmlUrl,
      downloadUrl: readme.downloadUrl,
      oauthTokenUsed: Boolean(token) && sourceType === "oauth"
    }
  };
}

function resolveOwnerRepo(body: Record<string, unknown>, sourceType: string): { owner: string; repo: string } {
  if (typeof body.repositoryUrl === "string") {
    const parsed = parseGitHubInput(body.repositoryUrl);
    if (parsed.kind === "repo-url") return { owner: parsed.username, repo: parsed.repo };
  }
  const username = typeof body.username === "string" ? body.username : "";
  if (sourceType === "username-repo" || sourceType === "oauth") return { owner: username, repo: username };
  const owner = typeof body.owner === "string" ? body.owner : username;
  const repo = typeof body.repo === "string" ? body.repo : "";
  if (owner && repo) return { owner, repo };
  throw new Error("USERNAME_INVALID");
}
