import { describe, expect, it } from "vitest";
import { buildDiff, createDeploymentExecutionPreview, createPagesEnablementPlan, createReadmeDeploymentPlan, createRollbackPlan } from "./deploy";

describe("deployment planning", () => {
  it("creates a README deployment plan with backup and PR defaults", () => {
    const plan = createReadmeDeploymentPlan({ username: "octocat", markdown: "# Hello" });
    expect(plan.repository).toBe("octocat");
    expect(plan.mode).toBe("pull-request");
    expect(plan.backupRequired).toBe(true);
    expect(plan.files[0].path).toBe("README.md");
  });

  it("builds added and unchanged diffs", () => {
    const plan = createReadmeDeploymentPlan({ username: "octocat", markdown: "# Hello" });
    const first = buildDiff(plan.files);
    const second = buildDiff(plan.files, { "README.md": first[0].newHash });
    expect(first[0].status).toBe("added");
    expect(second[0].status).toBe("unchanged");
  });

  it("creates execution previews with OAuth-gated operations", () => {
    const plan = createReadmeDeploymentPlan({ username: "octocat", markdown: "# Hello" });
    const preview = createDeploymentExecutionPreview({ plan, diff: buildDiff(plan.files), authenticated: false });
    expect(preview.requiresOAuth).toBe(true);
    expect(preview.operations.some((item) => item.action === "create-pull-request" && item.status === "requires-oauth")).toBe(true);
  });

  it("creates Pages enablement and rollback plans", () => {
    const pages = createPagesEnablementPlan({ username: "octocat", authenticated: true });
    const rollback = createRollbackPlan({ username: "octocat", repository: "octocat", rollbackLabel: "readme-backup", authenticated: true });
    expect(pages.operations.some((item) => item.action === "enable-pages")).toBe(true);
    expect(rollback.operations.some((item) => item.action === "rollback")).toBe(true);
  });
});
