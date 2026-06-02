import { describe, expect, it } from "vitest";
import { demoProfileConfig } from "@gps/core";
import { generateReadme } from "./readme";

describe("generateReadme", () => {
  it("generates a complete new-user README without empty data modules", () => {
    const config = demoProfileConfig("zero-user", "en-US");
    config.github = {
      ...config.github!,
      totalStars: 0,
      totalForks: 0,
      profile: { ...config.github!.profile, publicRepos: 0 },
      repositories: [],
      contributions: { ...config.github!.contributions, totalContributions: 0, commitContributions: 0 }
    };
    const readme = generateReadme(config);
    expect(readme.markdown).toContain("Learning Plan");
    expect(readme.markdown).toContain("beginning of my GitHub journey");
    expect(readme.markdown).not.toContain("undefined");
  });

  it("supports bilingual output", () => {
    const readme = generateReadme(demoProfileConfig("alex", "bilingual"));
    expect(readme.markdown).toContain("Hi, I'm");
    expect(readme.markdown).toContain("你好");
  });

  it("renders the complete README module set", () => {
    const readme = generateReadme(demoProfileConfig("alex", "en-US"));

    expect(readme.markdown).toContain("GitHub overview");
    expect(readme.markdown).toContain("GitHub streak");
    expect(readme.markdown).toContain("Contribution calendar");
    expect(readme.markdown).toContain("Language stats");
    expect(readme.markdown).toContain("Star growth");
    expect(readme.markdown).toContain("PR / Issue collaboration");
    expect(readme.markdown).toContain("Achievement wall");
    expect(readme.markdown).toContain("Visitor stats");
    expect(readme.markdown).toContain("Custom Markdown");
    expect(readme.markdown).toContain("/api/cards/streak");
    expect(readme.markdown).not.toContain("undefined");
  });
});
