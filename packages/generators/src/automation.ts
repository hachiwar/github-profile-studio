import { demoProfileConfig } from "@gps/core";
import { createMaintenanceRun, type MaintenanceRun } from "./maintenance";
import { defaultWorkflowConfigs, type WorkflowModule } from "./actions";

export type AutomationJobName =
  | "daily-readme-update"
  | "weekly-pages-data-update"
  | "star-snapshot"
  | "fork-snapshot"
  | "contribution-refresh"
  | "blog-rss-refresh"
  | "achievement-refresh"
  | "year-in-review"
  | "card-cache-cleanup"
  | "project-ranking"
  | "error-notification";

export type AutomationJob = {
  name: AutomationJobName;
  schedule: string;
  description: string;
  modules: WorkflowModule[];
  acceptanceIds: string[];
};

export type AutomationJobPlan = {
  job: AutomationJob;
  run: MaintenanceRun;
  operations: Array<{
    type: "write-file" | "snapshot" | "log";
    target: string;
    acceptanceIds: string[];
  }>;
};

export const automationJobs: AutomationJob[] = [
  { name: "daily-readme-update", schedule: "0 6 * * *", description: "Refresh generated README data and dynamic module snapshots.", modules: ["readme", "contributions", "achievements", "card-cache"], acceptanceIds: ["11-001", "11-004", "11-005"] },
  { name: "weekly-pages-data-update", schedule: "0 6 * * 1", description: "Refresh GitHub Pages JSON, SEO summaries, and project ranking data.", modules: ["pages-data", "project-ranking"], acceptanceIds: ["11-002", "11-004", "11-005"] },
  { name: "star-snapshot", schedule: "0 5 * * *", description: "Record repository and account-level Star snapshots.", modules: ["star-snapshot"], acceptanceIds: ["03-017", "11-003"] },
  { name: "fork-snapshot", schedule: "10 5 * * *", description: "Record repository and account-level Fork snapshots.", modules: ["fork-snapshot"], acceptanceIds: ["11-003"] },
  { name: "contribution-refresh", schedule: "20 5 * * *", description: "Refresh contribution calendar, streak, monthly, weekly, and hourly stats.", modules: ["contributions"], acceptanceIds: ["11-004"] },
  { name: "blog-rss-refresh", schedule: "30 5 * * *", description: "Refresh configured blog RSS feeds.", modules: ["blog-rss"], acceptanceIds: ["11-004"] },
  { name: "achievement-refresh", schedule: "40 5 * * *", description: "Recalculate achievement unlocks, progress, and annual summary data.", modules: ["achievements"], acceptanceIds: ["07-006", "11-004"] },
  { name: "year-in-review", schedule: "0 8 1 1 *", description: "Generate annual GitHub review summaries.", modules: ["year-in-review"], acceptanceIds: ["11-004", "N-GROW-009"] },
  { name: "card-cache-cleanup", schedule: "0 */6 * * *", description: "Expire stale dynamic card cache entries.", modules: ["card-cache"], acceptanceIds: ["11-004"] },
  { name: "project-ranking", schedule: "0 7 * * *", description: "Update featured project and repository rankings.", modules: ["project-ranking"], acceptanceIds: ["11-004"] },
  { name: "error-notification", schedule: "*/15 * * * *", description: "Aggregate automation failures for user-facing logs.", modules: ["error-notification"], acceptanceIds: ["11-004"] }
];

export function createAutomationJobPlan(name: AutomationJobName, username = "new-developer", generatedAt?: string): AutomationJobPlan {
  const job = automationJobs.find((item) => item.name === name);
  if (!job) throw new Error(`Unknown automation job: ${name}`);
  const config = demoProfileConfig(username, "en-US");
  const workflow = defaultWorkflowConfigs().find((item) => item.modules.some((module) => job.modules.includes(module))) ?? defaultWorkflowConfigs()[0];
  const run = createMaintenanceRun({ config, modules: job.modules, workflow, generatedAt });
  return {
    job,
    run,
    operations: [
      ...run.files.map((item) => ({ type: "write-file" as const, target: item.path, acceptanceIds: item.acceptanceIds })),
      ...run.snapshots
        .filter((item) => job.modules.includes(item.kind === "star" ? "star-snapshot" : "fork-snapshot"))
        .map((item) => ({ type: "snapshot" as const, target: `${item.kind}:${item.repoFullName}`, acceptanceIds: job.acceptanceIds })),
      ...run.logs.map((item) => ({ type: "log" as const, target: item.message, acceptanceIds: item.acceptanceIds }))
    ]
  };
}

export function createAutomationQueueSnapshot(username = "new-developer", generatedAt?: string): AutomationJobPlan[] {
  return automationJobs.map((job) => createAutomationJobPlan(job.name, username, generatedAt));
}
