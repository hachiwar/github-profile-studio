import { NextRequest, NextResponse } from "next/server";
import { buildThemeShareLink } from "@gps/core";

export function GET(request: NextRequest) {
  const themeKey = request.nextUrl.searchParams.get("theme") ?? "github-native";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return NextResponse.json({
    theme: themeKey,
    shareUrl: buildThemeShareLink(themeKey, appUrl)
  });
}

