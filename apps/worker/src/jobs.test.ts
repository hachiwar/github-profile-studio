import { describe, expect, it } from "vitest";
import { createWorkerJobPlan, createWorkerQueueSnapshot, workerJobs } from "./jobs";

describe("worker jobs", () => {
  it("maps every scheduled job to executable maintenance operations", () => {
    const queue = createWorkerQueueSnapshot("octocat", "2026-06-02T00:00:00.000Z");
    expect(queue).toHaveLength(workerJobs.length);
    expect(queue.every((plan) => plan.operations.length > 0)).toBe(true);
  });

  it("creates dedicated snapshot operations", () => {
    const plan = createWorkerJobPlan("star-snapshot", "octocat", "2026-06-02T00:00:00.000Z");
    expect(plan.operations.some((item) => item.type === "snapshot" && item.target.startsWith("star:"))).toBe(true);
    expect(plan.job.acceptanceIds).toEqual(expect.arrayContaining(["03-017", "11-003"]));
  });

  it("includes configurable workflow evidence for generated runs", () => {
    const plan = createWorkerJobPlan("daily-readme-update", "octocat", "2026-06-02T00:00:00.000Z");
    expect(plan.run.files.some((item) => item.path === ".github/workflows/profile-studio-update.yml")).toBe(true);
    expect(plan.run.summary.acceptanceIds).toEqual(expect.arrayContaining(["11-001", "11-005", "11-007"]));
  });
});
