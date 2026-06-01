import { describe, expect, it } from "vitest";
import { demoProfileConfig } from "@gps/core";
import { checkReadmeCompatibility } from "./readme-compatibility";

describe("checkReadmeCompatibility", () => {
  it("blocks unsafe markdown content", () => {
    const issues = checkReadmeCompatibility("<script>alert(1)</script>\n[bad](javascript:alert(1))", demoProfileConfig("alex", "en-US"));
    expect(issues.map((issue) => issue.code)).toContain("SCRIPT_TAG_BLOCKED");
    expect(issues.map((issue) => issue.code)).toContain("JAVASCRIPT_URL_BLOCKED");
  });

  it("adds privacy warnings before public submission", () => {
    const issues = checkReadmeCompatibility("# Hello", demoProfileConfig("alex", "en-US"));
    expect(issues.some((issue) => issue.code.startsWith("PRIVACY_"))).toBe(true);
  });
});

