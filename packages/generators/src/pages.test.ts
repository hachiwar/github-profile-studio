import { describe, expect, it } from "vitest";
import { demoProfileConfig } from "@gps/core";
import { generatePagesSite } from "./pages";

describe("generatePagesSite", () => {
  it("generates a complete static Pages site with required sections and controls", () => {
    const bundle = generatePagesSite(demoProfileConfig("octocat", "en-US"));
    const html = bundle.files["index.html"];
    const script = bundle.files["script.js"];
    const data = bundle.files["data/github.json"];

    expect(html).toContain('id="hero"');
    expect(html).toContain('id="education"');
    expect(html).toContain('id="skills"');
    expect(html).toContain('id="learning-directions"');
    expect(html).toContain('id="learning-plan"');
    expect(html).toContain('id="projects"');
    expect(html).toContain('id="timeline"');
    expect(html).toContain('id="growth-roadmap"');
    expect(html).toContain('id="github"');
    expect(html).toContain('id="future-goals"');
    expect(html).toContain('id="achievements"');
    expect(html).toContain('id="resume"');
    expect(html).toContain('id="blog"');
    expect(html).toContain('id="contact"');
    expect(html).toContain('id="theme-toggle"');
    expect(html).toContain('id="language-toggle"');
    expect(html).toContain('id="back-to-top"');
    expect(script).toContain("theme-toggle");
    expect(script).toContain("language-toggle");
    expect(script).toContain("back-to-top");
    expect(data).toContain("\"profile\"");
    expect(data).toContain("\"learningPlan\"");
  });

  it("generates deploy support files", () => {
    const bundle = generatePagesSite(demoProfileConfig("octocat", "en-US"));
    expect(Object.keys(bundle.files)).toContain("README.md");
    expect(Object.keys(bundle.files)).toContain("404.html");
    expect(Object.keys(bundle.files)).toContain("robots.txt");
    expect(Object.keys(bundle.files)).toContain("sitemap.xml");
    expect(Object.keys(bundle.files)).toContain(".github/workflows/update-pages.yml");
  });

  it("generates a non-empty site for zero-repository users", () => {
    const config = demoProfileConfig("zero-user", "en-US");
    config.github = {
      ...config.github!,
      repositories: [],
      totalStars: 0,
      totalForks: 0,
      profile: { ...config.github!.profile, publicRepos: 0 },
      contributions: { ...config.github!.contributions, totalContributions: 0 }
    };
    const html = generatePagesSite(config).files["index.html"];

    expect(html).toContain('id="hero"');
    expect(html).toContain('id="projects"');
    expect(html).toContain('id="github"');
    expect(html).toContain('id="contact"');
    expect(html).not.toContain("undefined");
  });
});
