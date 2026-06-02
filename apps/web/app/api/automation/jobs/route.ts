import { NextRequest, NextResponse } from "next/server";
import { automationJobs, createAutomationQueueSnapshot } from "@gps/generators";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username") ?? "new-developer";
  const generatedAt = request.nextUrl.searchParams.get("generatedAt") ?? undefined;
  const queue = createAutomationQueueSnapshot(username, generatedAt).map((plan) => ({
    job: plan.job,
    summary: plan.run.summary,
    operations: plan.operations,
    files: plan.run.files.map((file) => ({
      path: file.path,
      contentType: file.contentType,
      reason: file.reason,
      acceptanceIds: file.acceptanceIds
    }))
  }));

  return NextResponse.json({
    jobs: automationJobs,
    queue,
    acceptanceIds: ["11-001", "11-002", "11-003", "11-004", "11-005", "11-007"]
  });
}
