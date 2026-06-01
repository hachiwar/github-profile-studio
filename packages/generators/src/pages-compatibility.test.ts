import { describe, expect, it } from "vitest";
import { demoProfileConfig } from "@gps/core";
import { generatePagesSite } from "./pages";
import { checkPagesCompatibility } from "./pages-compatibility";

describe("checkPagesCompatibility", () => {
  it("passes a generated Pages bundle", () => {
    const bundle = generatePagesSite(demoProfileConfig("alex", "en-US"));
    expect(checkPagesCompatibility(bundle).filter((issue) => issue.severity === "error")).toHaveLength(0);
  });

  it("flags missing required files", () => {
    const issues = checkPagesCompatibility({ files: { "index.html": "<html></html>" }, sections: [], warnings: [] });
    expect(issues.some((issue) => issue.code === "MISSING_FILE")).toBe(true);
  });
});

