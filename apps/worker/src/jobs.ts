export type WorkerJobName =
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

export type WorkerJob = {
  name: WorkerJobName;
  schedule: string;
  description: string;
};

export const workerJobs: WorkerJob[] = [
  { name: "daily-readme-update", schedule: "0 6 * * *", description: "Refresh generated README data and dynamic module snapshots." },
  { name: "weekly-pages-data-update", schedule: "0 6 * * 1", description: "Refresh GitHub Pages JSON, SEO summaries, and project ranking data." },
  { name: "star-snapshot", schedule: "0 5 * * *", description: "Record repository and account-level Star snapshots." },
  { name: "fork-snapshot", schedule: "10 5 * * *", description: "Record repository and account-level Fork snapshots." },
  { name: "contribution-refresh", schedule: "20 5 * * *", description: "Refresh contribution calendar, streak, monthly, weekly, and hourly stats." },
  { name: "blog-rss-refresh", schedule: "30 5 * * *", description: "Refresh configured blog RSS feeds." },
  { name: "achievement-refresh", schedule: "40 5 * * *", description: "Recalculate achievement unlocks, progress, and annual summary data." },
  { name: "year-in-review", schedule: "0 8 1 1 *", description: "Generate annual GitHub review summaries." },
  { name: "card-cache-cleanup", schedule: "0 */6 * * *", description: "Expire stale dynamic card cache entries." },
  { name: "project-ranking", schedule: "0 7 * * *", description: "Update featured project and repository rankings." },
  { name: "error-notification", schedule: "*/15 * * * *", description: "Aggregate automation failures for user-facing logs." }
];

