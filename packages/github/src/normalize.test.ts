import { describe, expect, it } from "vitest";
import { normalizeRepository, normalizeUser } from "./normalize";

describe("GitHub normalizers", () => {
  it("normalizes user payloads", () => {
    const user = normalizeUser({
      login: "octocat",
      id: 1,
      type: "Organization",
      name: "Octocat",
      blog: "github.blog",
      followers: 10,
      following: 2,
      public_repos: 3,
      public_gists: 4,
      created_at: "2020-01-01T00:00:00.000Z"
    });

    expect(user.githubUsername).toBe("octocat");
    expect(user.accountType).toBe("Organization");
    expect(user.blog).toBe("https://github.blog");
    expect(user.publicRepos).toBe(3);
    expect(user.accountAgeDays).toBeGreaterThan(2000);
    expect(user.accountAgeYears).toBeGreaterThan(5);
  });

  it("normalizes repository payloads and distinguishes subscribers", () => {
    const repo = normalizeRepository({
      id: 2,
      owner: { login: "octocat" },
      name: "hello-world",
      full_name: "octocat/hello-world",
      stargazers_count: 8,
      watchers_count: 8,
      subscribers_count: 3,
      forks_count: 2,
      open_issues_count: 1,
      default_branch: "main",
      archived: false,
      fork: true,
      is_template: true,
      visibility: "public",
      has_pages: true,
      has_wiki: true,
      has_discussions: false
    });

    expect(repo.stars).toBe(8);
    expect(repo.watchers).toBe(8);
    expect(repo.subscribers).toBe(3);
    expect(repo.isFork).toBe(true);
    expect(repo.isTemplate).toBe(true);
    expect(repo.visibility).toBe("public");
    expect(repo.hasPages).toBe(true);
  });
});
