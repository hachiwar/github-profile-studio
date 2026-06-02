import { describe, expect, it } from "vitest";
import { demoGitHubDataset } from "./fixtures";
import { defaultNewUserFormDraft } from "./new-user-form";
import { evaluateNewUserUpgrade, mergeManualProjectsWithGitHub, newUserUpgradeThresholds } from "./new-user-upgrade";

describe("new-user upgrade", () => {
  it("evaluates repository, commit, contribution, star, PR, and issue thresholds", () => {
    const draft = defaultNewUserFormDraft("alex", "en-US");
    const dataset = demoGitHubDataset("alex");
    dataset.profile.publicRepos = newUserUpgradeThresholds.repositories;
    dataset.contributions.commitContributions = newUserUpgradeThresholds.commits;
    dataset.contributions.totalContributions = newUserUpgradeThresholds.contributions;
    dataset.totalStars = newUserUpgradeThresholds.stars;
    dataset.pullRequests.total = newUserUpgradeThresholds.pullRequestsOrIssues;
    const upgrade = evaluateNewUserUpgrade(draft, dataset);

    expect(upgrade.acceptanceIds).toEqual(expect.arrayContaining(["N-UP-001", "N-UP-002", "N-UP-003", "N-UP-004", "N-UP-005"]));
    expect(Object.values(upgrade.triggered).every(Boolean)).toBe(true);
    expect(upgrade.targetMode).toBe("data-enhanced");
  });

  it("preserves personal information, merges projects, provides diff and rollback, and supports long-term hybrid mode", () => {
    const draft = defaultNewUserFormDraft("alex", "en-US");
    const dataset = demoGitHubDataset("alex");
    dataset.profile.publicRepos = 3;
    dataset.contributions.commitContributions = 20;
    dataset.contributions.totalContributions = 40;
    dataset.totalStars = 0;
    dataset.pullRequests.total = 5;
    const merged = mergeManualProjectsWithGitHub(draft, dataset);
    const upgrade = evaluateNewUserUpgrade(draft, dataset);

    expect(upgrade.acceptanceIds).toEqual(expect.arrayContaining(["N-UP-006", "N-UP-007", "N-UP-008", "N-UP-009", "N-UP-010"]));
    expect(upgrade.preservePersonalInfo.basics.displayName).toBe(draft.basics.displayName);
    expect(merged.length).toBeGreaterThan(draft.manualProjects.length);
    expect(upgrade.diffPreview.map((item) => item.field)).toEqual(expect.arrayContaining(["mode", "manualProjects", "githubStats"]));
    expect(upgrade.rollbackPlan.restoreDraft.username).toBe("alex");
    expect(upgrade.longTermMode).toBe("hybrid");
  });
});
