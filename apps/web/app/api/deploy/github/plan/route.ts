import { NextRequest, NextResponse } from "next/server";
import { demoProfileConfig } from "@gps/core";
import { generatePagesSite, generateReadme } from "@gps/generators";
import { buildDiff, createPagesDeploymentPlan, createReadmeDeploymentPlan } from "@gps/github";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username : "new-developer";
  const target = body.target === "pages" ? "pages" : "readme";
  const locale = body.locale === "zh-CN" || body.locale === "bilingual" ? body.locale : "en-US";
  const config = demoProfileConfig(username, locale);

  const plan =
    target === "pages"
      ? createPagesDeploymentPlan({ username, bundle: generatePagesSite(config), mode: "pull-request" })
      : createReadmeDeploymentPlan({ username, markdown: generateReadme(config).markdown, mode: "pull-request" });

  return NextResponse.json({
    plan,
    diff: buildDiff(plan.files, body.existingHashes ?? {})
  });
}

