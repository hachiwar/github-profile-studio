import { NextRequest, NextResponse } from "next/server";
import { exportThemeJson } from "@gps/core";

export function GET(request: NextRequest) {
  const themeKey = request.nextUrl.searchParams.get("theme") ?? "github-native";
  return NextResponse.json(exportThemeJson(themeKey));
}

