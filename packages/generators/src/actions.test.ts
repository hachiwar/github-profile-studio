import { describe, expect, it } from "vitest";
import { defaultWorkflowConfigs, generateWorkflow } from "./actions";

describe("generateWorkflow", () => {
  it("generates daily, weekly, and manual workflows", () => {
    const workflows = defaultWorkflowConfigs().map(generateWorkflow);
    expect(workflows[0]).toContain("schedule:");
    expect(workflows[1]).toContain("0 6 * * 1");
    expect(workflows[2]).toContain("workflow_dispatch");
  });

  it("includes required automation modules", () => {
    const daily = generateWorkflow(defaultWorkflowConfigs()[0]);
    expect(daily).toContain("star-snapshot");
    expect(daily).toContain("fork-snapshot");
    expect(daily).toContain("achievements");
  });
});

