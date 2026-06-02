import { describe, expect, it } from "vitest";
import { demoGitHubDataset } from "./fixtures";
import { defaultNewUserFormDraft } from "./new-user-form";
import { planNewUserLayout } from "./new-user-layout";

describe("new-user layout planning", () => {
  it("plans education, courses, projects, learning plan, and status layouts", () => {
    const draft = defaultNewUserFormDraft("alex", "en-US");
    const plan = planNewUserLayout(draft);

    expect(plan.acceptanceIds).toEqual(expect.arrayContaining([
      "N-LAYOUT-001",
      "N-LAYOUT-002",
      "N-LAYOUT-003",
      "N-LAYOUT-004",
      "N-LAYOUT-005",
      "N-LAYOUT-006"
    ]));
    expect(plan.educationLayout).toBe("single-card");
    expect(plan.courseLayout).toBe("tag-list");
    expect(plan.projectLayout).toBe("single-feature");
    expect(plan.learningPlanLayout).not.toBe("compact-list");
    expect(plan.jobStatusLayout).toBe("resume-callout");
    expect(plan.learningStatusLayout).toBe("student");
  });

  it("weakens GitHub data, enables open-source newcomer layout, and supplies defaults", () => {
    const draft = defaultNewUserFormDraft("alex", "en-US");
    draft.basics.avatarUrl = undefined;
    const dataset = demoGitHubDataset("alex");
    dataset.profile.publicRepos = 0;
    dataset.contributions.totalContributions = 0;
    dataset.totalStars = 0;
    dataset.pullRequests.total = 0;
    dataset.issues.total = 0;
    const plan = planNewUserLayout(draft, dataset);

    expect(plan.acceptanceIds).toEqual(expect.arrayContaining([
      "N-LAYOUT-007",
      "N-LAYOUT-008",
      "N-LAYOUT-009",
      "N-LAYOUT-010",
      "N-LAYOUT-011"
    ]));
    expect(plan.openSourceNewcomerLayout).toBe(true);
    expect(plan.githubDataEmphasis).toBe("manual-first");
    expect(plan.defaultAvatar).toContain("identicons");
    expect(plan.defaultProjectCovers[0].coverKey).toContain("personal");
    expect(plan.copyCompletion).toHaveLength(0);
  });
});
