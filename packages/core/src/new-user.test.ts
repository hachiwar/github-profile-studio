import { describe, expect, it } from "vitest";
import { buildNewUserConfig, recommendNewUserMode, summarizeNewUserConfig } from "./new-user";

describe("new-user automation", () => {
  it("recommends new-user mode for a zero-data account", () => {
    const recommendation = recommendNewUserMode({
      username: "zero",
      publicRepos: 0,
      totalContributions: 0,
      totalStars: 0,
      pullRequests: 0,
      issues: 0,
      hasContributionGraph: false
    });

    expect(recommendation.recommendedMode).toBe("new-user");
    expect(recommendation.hiddenModules).toContain("star-growth");
  });

  it("builds a config with privacy warnings and English default", () => {
    const config = buildNewUserConfig("alex", "en-US");
    const summary = summarizeNewUserConfig(config);
    expect(summary.locale).toBe("en-US");
    expect(summary.privacyWarnings.length).toBeGreaterThan(0);
  });
});

