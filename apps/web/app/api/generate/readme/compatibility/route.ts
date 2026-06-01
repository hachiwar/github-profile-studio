import { NextRequest, NextResponse } from "next/server";
import { demoProfileConfig } from "@gps/core";
import { checkReadmeCompatibility } from "@gps/generators";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const markdown = typeof body.markdown === "string" ? body.markdown : "";
  const username = typeof body.username === "string" ? body.username : "new-developer";
  const locale = body.locale === "zh-CN" || body.locale === "bilingual" ? body.locale : "en-US";
  return NextResponse.json({
    issues: checkReadmeCompatibility(markdown, demoProfileConfig(username, locale))
  });
}

