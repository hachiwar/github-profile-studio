import { NextRequest, NextResponse } from "next/server";
import { studioErrors } from "@gps/core";
import { buildReadmeExportPackage } from "@gps/generators";
import { exportPackageResponse, resolveExportConfig } from "../_shared";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const config = resolveExportConfig(body);
    return exportPackageResponse(buildReadmeExportPackage(config), request.nextUrl.searchParams.get("format"));
  } catch {
    return NextResponse.json({ error: studioErrors.DOWNLOAD_FAILED }, { status: 500 });
  }
}
