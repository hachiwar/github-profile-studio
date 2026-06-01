import { NextRequest, NextResponse } from "next/server";
import { importThemeJson } from "@gps/core";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const result = importThemeJson(body);
  return NextResponse.json(result, { status: result.valid ? 200 : 400 });
}

