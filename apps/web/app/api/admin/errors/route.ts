import { NextResponse } from "next/server";
import { studioErrors } from "@gps/core";

export async function GET() {
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    errors: [],
    catalog: Object.values(studioErrors).map((error) => ({
      code: error.code,
      title: error.title.en,
      retryable: error.retryable,
      reason: error.reason.en,
      solution: error.solution.en,
      docsPath: error.docsPath
    })),
    notifications: {
      dashboard: true,
      deploymentLog: true,
      retryableJobs: true
    },
    acceptanceIds: ["12-001", "12-002", "12-003", "12-004", "16-004"]
  });
}
