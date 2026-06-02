import { NextRequest, NextResponse } from "next/server";
import { createAutomationQueueSnapshot } from "@gps/generators";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username") ?? "new-developer";
  const queue = createAutomationQueueSnapshot(username).map((plan) => ({
    name: plan.job.name,
    schedule: plan.job.schedule,
    modules: plan.job.modules,
    status: "ready",
    operationCount: plan.operations.length,
    fileCount: plan.run.files.length,
    acceptanceIds: plan.job.acceptanceIds
  }));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    queue,
    statuses: ["ready", "running", "retrying", "failed", "completed"],
    acceptanceIds: ["11-001", "11-002", "11-003", "11-004", "11-005", "11-007", "16-003"]
  });
}
