import { describe, expect, it } from "vitest";
import { createReadmeDeploymentPlan, buildDiff } from "./deploy";

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
});

