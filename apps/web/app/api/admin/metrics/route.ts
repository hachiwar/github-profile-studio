import { NextResponse } from "next/server";
import { automationJobs, defaultWorkflowConfigs } from "@gps/generators";

export async function GET() {
  const workflows = defaultWorkflowConfigs();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    product: "GitHub Profile Studio",
    metrics: {
      users: { total: 1, oauthConnected: 0, newUserMode: 1, privacyConfigured: 1 },
      generations: { readme: 1, pages: 1, cards: 7, achievements: 1 },
      githubApi: { cachedRequests: 0, liveRequests: 0, degradedFallbacks: 0, rateLimitRemaining: null },
      deployments: { previews: 1, executed: 0, rollbacks: 0, failed: 0 },
      automation: { jobs: automationJobs.length, workflows: workflows.length, enabledModules: [...new Set(workflows.flatMap((item) => item.modules))].length }
    },
    popular: {
      templates: ["student-developer", "student-portfolio", "github-native"],
      cards: ["stats", "streak", "languages", "achievements"],
      locales: ["en-US", "zh-CN", "bilingual"]
    },
    acceptanceIds: ["16-001", "16-002", "16-003", "16-004", "11-005"]
  });
}
