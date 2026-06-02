import { describe, expect, it } from "vitest";
import { buildDetectionStatusCards } from "./detection";
import { emptyRepositoryStatus, type GitHubDetectionResult } from "./client";

describe("GitHub detection status cards", () => {
  it("summarizes account, profile README, Pages, and next actions", () => {
    const result: GitHubDetectionResult = {
      username: "octocat",
      userExists: true,
      userType: "Organization",
      profile: {
        githubUsername: "octocat",
        accountType: "Organization",
        displayName: "Octo Org",
        avatarUrl: "https://example.com/avatar.png",
        bio: "Open source organization",
        company: "GitHub",
        location: "Remote",
        blog: "https://example.com",
        followers: 10,
        following: 0,
        publicRepos: 2,
        publicGists: 0
      },
      profileReadmeRepository: {
        exists: true,
        isPublic: true,
        hasReadme: true,
        hasIndexHtml: false,
        hasWorkflows: true,
        defaultBranch: "main",
        pages: { enabled: false }
      },
      pagesRepository: {
        exists: true,
        isPublic: true,
        hasReadme: false,
        hasIndexHtml: true,
        hasWorkflows: false,
        defaultBranch: "main",
        pages: { enabled: true, branch: "main", path: "/", url: "https://octocat.github.io" }
      },
      recommendedMode: "hybrid",
      nextActions: ["Generate and commit README.md."]
    };

    const cards = buildDetectionStatusCards(result);

    expect(cards.flatMap((card) => card.acceptanceIds)).toEqual(expect.arrayContaining(["02-004", "02-005", "02-006", "02-009", "02-010", "02-011", "02-012", "02-013", "02-014", "02-016"]));
    expect(cards.find((card) => card.id === "user")?.detail).toContain("Organization");
    expect(cards.find((card) => card.id === "pages")?.detail).toContain("Pages source");
  });

  it("shows missing status for nonexistent accounts and repositories", () => {
    const result: GitHubDetectionResult = {
      username: "missing",
      userExists: false,
      profileReadmeRepository: emptyRepositoryStatus(),
      pagesRepository: emptyRepositoryStatus(),
      recommendedMode: "new-user",
      nextActions: ["Check the username spelling."]
    };

    expect(buildDetectionStatusCards(result).filter((card) => card.status === "missing").length).toBeGreaterThan(1);
  });
});
