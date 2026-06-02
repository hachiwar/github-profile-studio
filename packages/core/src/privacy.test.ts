import { describe, expect, it } from "vitest";
import { demoProfileConfig } from "./fixtures";
import { hideSensitiveSettings, runPrivacyCheck } from "./privacy";

describe("privacy policy", () => {
  it("warns before sensitive fields are shown", () => {
    const checks = runPrivacyCheck(demoProfileConfig("octocat", "en-US"));
    expect(checks.some((item) => item.field === "realName")).toBe(true);
    expect(checks.some((item) => item.scope === "pages")).toBe(true);
  });

  it("hides sensitive settings by default action", () => {
    const hidden = hideSensitiveSettings(demoProfileConfig("octocat", "en-US"));
    expect(hidden.privacy.filter((item) => item.sensitive).every((item) => !item.visibleInReadme && !item.visibleInPages)).toBe(true);
  });
});
