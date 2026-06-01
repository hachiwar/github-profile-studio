import { NextRequest, NextResponse } from "next/server";
import { importReadmeMarkdown } from "@gps/generators";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const markdown = typeof body.markdown === "string" ? body.markdown : "";
  const sourceType = typeof body.sourceType === "string" ? body.sourceType : "paste";

  return NextResponse.json(importReadmeMarkdown(markdown, sourceType as never));
}

