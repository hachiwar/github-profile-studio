import { NextRequest, NextResponse } from "next/server";
import { demoGitHubDataset } from "@gps/core";
import { renderCardSvg } from "@gps/cards";

export async function GET(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const search = request.nextUrl.searchParams;
  const user = search.get("user") || "octocat";
  const locale = search.get("locale") === "zh-CN" ? "zh-CN" : "en-US";
  const format = search.get("format") || "svg";
  const dataset = demoGitHubDataset(user);

  if (format === "json") {
    return NextResponse.json({ type, user, locale, dataset });
  }

  const svg = renderCardSvg({
    type,
    user,
    locale,
    dataset,
    theme: search.get("theme") || "github-native",
    format: "svg"
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600"
    }
  });
}
