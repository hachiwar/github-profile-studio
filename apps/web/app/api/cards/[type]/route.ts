import { NextRequest, NextResponse } from "next/server";
import type { CardRequest } from "@gps/core";
import { buildCardEmbeds, renderCardSvg, renderErrorSvg, resolveCardDefinition } from "@gps/cards";
import { renderCardPng } from "@gps/cards/png";
import { GitHubClient, parseGitHubInput } from "@gps/github";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const search = request.nextUrl.searchParams;
  const format = parseFormat(search.get("format"));
  const cacheSeconds = clampNumber(Number(search.get("cache_seconds") ?? "300"), 60, 86_400, 300);

  try {
    const parsed = parseGitHubInput(search.get("user") || "octocat");
    const client = new GitHubClient(process.env.GITHUB_TOKEN);
    const github = await client.getDataset(parsed.username, {
      ttlSeconds: cacheSeconds,
      forceRefresh: search.get("refresh") === "true",
      enrichRepositories: format === "json"
    });
    const cardRequest: CardRequest = {
      type,
      user: parsed.username,
      locale: parseLocale(search.get("locale")),
      dataset: github.dataset,
      theme: search.get("theme") || "github-native",
      format,
      repo: search.get("repo") ?? (parsed.kind === "repo-url" ? parsed.repo : undefined),
      period: parsePeriod(search.get("period")),
      layout: parseLayout(search.get("layout")),
      hideBorder: parseBoolean(search.get("hide_border")),
      borderRadius: parseOptionalNumber(search.get("border_radius"), 0, 32),
      bgColor: parseColor(search.get("bg_color")),
      titleColor: parseColor(search.get("title_color")),
      textColor: parseColor(search.get("text_color")),
      iconColor: parseColor(search.get("icon_color")),
      width: parseOptionalNumber(search.get("width"), 280, 1200),
      height: parseOptionalNumber(search.get("height"), 140, 800),
      showIcons: parseBoolean(search.get("show_icons"), true),
      hide: parseList(search.get("hide")),
      include: parseList(search.get("include")),
      cacheSeconds,
      animation: parseAnimation(search.get("animation"))
    };

    if (format === "json") {
      return NextResponse.json(
        {
          type,
          resolvedType: resolveCardDefinition(type)?.type ?? type,
          user: parsed.username,
          locale: cardRequest.locale,
          parameters: serializeCardParameters(cardRequest),
          dataset: github.dataset,
          embeds: buildCardEmbeds(cardRequest, process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
          cache: github.cache,
          rateLimit: github.rateLimit,
          warnings: github.warnings
        },
        { headers: cacheHeaders(cacheSeconds) }
      );
    }

    if (format === "png") {
      const png = renderCardPng(cardRequest);
      return new NextResponse(Buffer.from(png), {
        headers: {
          "Content-Type": "image/png",
          ...cacheHeaders(cacheSeconds)
        }
      });
    }

    return new NextResponse(renderCardSvg(cardRequest), {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        ...cacheHeaders(cacheSeconds)
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CARD_GENERATION_FAILED";
    if (format === "json") {
      return NextResponse.json({ error: message }, { status: 400, headers: cacheHeaders(60) });
    }
    return new NextResponse(renderErrorSvg(message), {
      status: 400,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        ...cacheHeaders(60)
      }
    });
  }
}

function parseLocale(value: string | null): CardRequest["locale"] {
  if (value === "zh-CN" || value === "bilingual") return value;
  return "en-US";
}

function parseFormat(value: string | null): CardRequest["format"] {
  if (value === "png" || value === "json") return value;
  return "svg";
}

function parsePeriod(value: string | null): CardRequest["period"] {
  if (value === "7d" || value === "30d" || value === "90d" || value === "365d" || value === "all") return value;
  return "all";
}

function parseLayout(value: string | null): CardRequest["layout"] {
  if (value === "compact" || value === "wide" || value === "grid") return value;
  return "default";
}

function parseAnimation(value: string | null): CardRequest["animation"] {
  if (value === "subtle" || value === "pulse") return value;
  return "none";
}

function parseBoolean(value: string | null, fallback = false): boolean {
  if (value === null) return fallback;
  return value === "1" || value === "true" || value === "yes";
}

function parseOptionalNumber(value: string | null, min: number, max: number): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return clampNumber(parsed, min, max, min);
}

function clampNumber(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, Math.round(value)));
}

function parseList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 32);
}

function parseColor(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(trimmed)) return `#${trimmed}`;
  if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(trimmed)) return trimmed;
  if (/^[a-z]+$/i.test(trimmed)) return trimmed.slice(0, 24);
  return undefined;
}

function serializeCardParameters(request: CardRequest) {
  return {
    theme: request.theme,
    layout: request.layout,
    hide_border: request.hideBorder,
    border_radius: request.borderRadius,
    bg_color: request.bgColor,
    title_color: request.titleColor,
    text_color: request.textColor,
    icon_color: request.iconColor,
    locale: request.locale,
    height: request.height,
    width: request.width,
    show_icons: request.showIcons,
    hide: request.hide,
    include: request.include,
    period: request.period,
    repo: request.repo,
    format: request.format,
    cache_seconds: request.cacheSeconds,
    animation: request.animation
  };
}

function cacheHeaders(cacheSeconds: number): Record<string, string> {
  return {
    "Cache-Control": `public, max-age=${cacheSeconds}, stale-while-revalidate=${Math.max(3600, cacheSeconds * 4)}`,
    "X-Profile-Studio-Cache-Seconds": String(cacheSeconds)
  };
}
