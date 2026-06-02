import { NextRequest, NextResponse } from "next/server";
import { demoProfileConfig } from "@gps/core";
import { generatePagesSite, generateReadme } from "@gps/generators";
import { buildDiff, createDeploymentExecutionPreview, createPagesDeploymentPlan, createReadmeDeploymentPlan, decryptToken, GitHubClient, type DeploymentPlan } from "@gps/github";

const cookieName = "gps_github_token";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const plan = resolvePlan(body);
  const diff = buildDiff(plan.files, typeof body.existingHashes === "object" && body.existingHashes !== null ? (body.existingHashes as Record<string, string>) : {});
  const token = readToken(request);
  const preview = createDeploymentExecutionPreview({ plan, diff, authenticated: Boolean(token) });
  if (body.live !== true || !token) return NextResponse.json(preview);

  try {
    const client = new GitHubClient(token);
    const execution = await client.executeDeploymentPlan(plan);
    return NextResponse.json({ ...preview, execution, requiresOAuth: false });
  } catch (error) {
    return NextResponse.json(
      {
        ...preview,
        execution: { executed: false, error: error instanceof Error ? error.message : "DEPLOYMENT_EXECUTION_FAILED" },
        logs: [...preview.logs, { time: new Date().toISOString(), level: "error", message: error instanceof Error ? error.message : "Deployment execution failed." }]
      },
      { status: 502 }
    );
  }
}

function resolvePlan(body: Record<string, unknown>): DeploymentPlan {
  if (body.plan && typeof body.plan === "object") return body.plan as DeploymentPlan;
  const username = typeof body.username === "string" ? body.username : "new-developer";
  const target = body.target === "pages" ? "pages" : "readme";
  const locale = body.locale === "zh-CN" || body.locale === "bilingual" ? body.locale : "en-US";
  const config = demoProfileConfig(username, locale);
  return target === "pages"
    ? createPagesDeploymentPlan({ username, bundle: generatePagesSite(config), mode: body.mode === "direct-commit" ? "direct-commit" : "pull-request" })
    : createReadmeDeploymentPlan({ username, markdown: generateReadme(config).markdown, mode: body.mode === "direct-commit" ? "direct-commit" : "pull-request" });
}

function readToken(request: NextRequest): string | undefined {
  const cookie = request.cookies.get(cookieName)?.value;
  const tokenKey = process.env.TOKEN_ENCRYPTION_KEY;
  if (!cookie || !tokenKey) return undefined;
  try {
    const encrypted = JSON.parse(Buffer.from(cookie, "base64url").toString("utf8"));
    return decryptToken(encrypted, tokenKey);
  } catch {
    return undefined;
  }
}
