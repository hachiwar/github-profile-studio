import { NextRequest, NextResponse } from "next/server";
import { demoProfileConfig } from "@gps/core";
import { generatePagesSite, generateReadme } from "@gps/generators";
import { buildDiff, createDeploymentExecutionPreview, createPagesDeploymentPlan, createReadmeDeploymentPlan, type DeploymentPlan } from "@gps/github";

const cookieName = "gps_github_token";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const plan = resolvePlan(body);
  const diff = buildDiff(plan.files, typeof body.existingHashes === "object" && body.existingHashes !== null ? (body.existingHashes as Record<string, string>) : {});
  return NextResponse.json(
    createDeploymentExecutionPreview({
      plan,
      diff,
      authenticated: Boolean(request.cookies.get(cookieName)?.value)
    })
  );
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
