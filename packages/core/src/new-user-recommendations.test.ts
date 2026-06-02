import { describe, expect, it } from "vitest";
import { demoGitHubDataset } from "./fixtures";
import { defaultNewUserFormDraft } from "./new-user-form";
import { buildNewUserRecommendations } from "./new-user-recommendations";

describe("new-user recommendations", () => {
  it("recommends templates, modules, ordering, SEO, and theme", () => {
    const draft = defaultNewUserFormDraft("alex", "en-US");
    const recommendations = buildNewUserRecommendations(draft);

    expect(recommendations.acceptanceIds).toEqual(expect.arrayContaining([
      "N-REC-001",
      "N-REC-002",
      "N-REC-003",
      "N-REC-004",
      "N-REC-005",
      "N-REC-006",
      "N-REC-007",
      "N-REC-008"
    ]));
    expect(recommendations.readmeTemplate.key).toBe("student-developer");
    expect(recommendations.readmeModules).toContain("learning-plan");
    expect(recommendations.skillOrder[0]).toBe("TypeScript");
    expect(recommendations.projectOrder).toContain("Personal Profile Studio");
    expect(recommendations.pageTemplate.key).toBe("student-portfolio");
    expect(recommendations.homeSectionOrder[0]).toBe("hero");
    expect(recommendations.seo.title).toContain("GitHub Portfolio");
    expect(recommendations.theme.key).toBe("github-native");
  });

  it("switches recommendations when GitHub data becomes strong", () => {
    const draft = defaultNewUserFormDraft("alex", "en-US");
    const dataset = demoGitHubDataset("alex");
    dataset.profile.publicRepos = 12;
    dataset.contributions.totalContributions = 500;
    dataset.totalStars = 120;
    const recommendations = buildNewUserRecommendations(draft, dataset);

    expect(recommendations.readmeModules).toContain("github-overview");
    expect(recommendations.pageTemplate.key).toBe("personal-brand");
  });
});
