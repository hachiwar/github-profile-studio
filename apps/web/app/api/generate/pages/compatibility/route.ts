import { NextRequest, NextResponse } from "next/server";
import { checkPagesCompatibility } from "@gps/generators";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const files = typeof body.files === "object" && body.files !== null ? body.files : {};
  return NextResponse.json({
    issues: checkPagesCompatibility({
      files: files as Record<string, string>,
      sections: [],
      warnings: []
    })
  });
}

