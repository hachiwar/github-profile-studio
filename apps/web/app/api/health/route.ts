import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "github-profile-studio",
    generatedContentDefaultLocale: "en-US",
    supportedLocales: ["en-US", "zh-CN", "bilingual"]
  });
}

