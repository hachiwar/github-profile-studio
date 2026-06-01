import { NextRequest, NextResponse } from "next/server";
import { demoGitHubDataset } from "@gps/core";
import type { CardRequest } from "@gps/core";
import { buildCardEmbeds, renderCardSvg } from "@gps/cards";
import { renderCardPng } from "@gps/cards/png";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const search = request.nextUrl.searchParams;
  const user = search.get("user") || "octocat";
  const locale = search.get("locale") === "zh-CN" ? "zh-CN" : search.get("locale") === "bilingual" ? "bilingual" : "en-US";
  const format = search.get("format") || "svg";
  const dataset = demoGitHubDataset(user);
  const cardRequest: CardRequest = {
    type,
    user,
    locale,
    dataset,
    theme: search.get("theme") || "github-native",
    format: format === "png" ? ("png" as const) : format === "json" ? ("json" as const) : ("svg" as const)
  };

  if (format === "json") {
    return NextResponse.json({
      type,
      user,
      locale,
      dataset,
      embeds: buildCardEmbeds(cardRequest, process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
    });
  }

  if (format === "png") {
    const png = renderCardPng(cardRequest);
    return new NextResponse(Buffer.from(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=3600"
      }
    });
  }

  const svg = renderCardSvg(cardRequest);

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600"
    }
  });
}
