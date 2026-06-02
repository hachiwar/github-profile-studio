import { NextRequest, NextResponse } from "next/server";
import { createMaintenanceRun } from "@gps/generators";
import { resolveAutomationRequest } from "../_shared";

export async function POST(request: NextRequest) {
  const input = await resolveAutomationRequest(request);
  const run = createMaintenanceRun(input);
  return NextResponse.json({
    ...run,
    files: run.files.map((file) => ({
      ...file,
      preview: file.content.length > 1200 ? `${file.content.slice(0, 1200)}\n...` : file.content,
      content: undefined
    }))
  });
}
