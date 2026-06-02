import type { GitHubDataset, ManualProject } from "./domain";
import type { NewUserFormDraft } from "./new-user-form";
import { newUserFormDraftSchema } from "./new-user-form";

export const newUserUpgradeThresholds = {
  repositories: 3,
  commits: 50,
  contributions: 100,
  stars: 5,
  pullRequestsOrIssues: 5
};

export function evaluateNewUserUpgrade(input: NewUserFormDraft, dataset: GitHubDataset) {
  const draft = newUserFormDraftSchema.parse(input);
  const triggered = {
    repositories: dataset.profile.publicRepos >= newUserUpgradeThresholds.repositories,
    commits: dataset.contributions.commitContributions >= newUserUpgradeThresholds.commits,
    contributions: dataset.contributions.totalContributions >= newUserUpgradeThresholds.contributions,
    stars: dataset.totalStars >= newUserUpgradeThresholds.stars,
    pullRequestsOrIssues: dataset.pullRequests.total + dataset.issues.total >= newUserUpgradeThresholds.pullRequestsOrIssues
  };
  const score = Object.values(triggered).filter(Boolean).length;
  const targetMode = score >= 4 ? "data-enhanced" : score >= 2 ? "hybrid" : "new-user";
  const mergedProjects = mergeManualProjectsWithGitHub(draft, dataset);
  return {
    triggered,
    targetMode,
    preservePersonalInfo: pickPersonalInfo(draft),
    mergedProjects,
    diffPreview: buildUpgradeDiff(draft, dataset, targetMode, mergedProjects),
    rollbackPlan: {
      mode: "new-user",
      restoreDraft: draft,
      reason: "User can return to the pre-upgrade new-user draft."
    },
    longTermMode: targetMode === "data-enhanced" ? "data-enhanced" : "hybrid",
    acceptanceIds: ["N-UP-001", "N-UP-002", "N-UP-003", "N-UP-004", "N-UP-005", "N-UP-006", "N-UP-007", "N-UP-008", "N-UP-009", "N-UP-010"]
  };
}

export function mergeManualProjectsWithGitHub(draft: NewUserFormDraft, dataset: GitHubDataset): ManualProject[] {
  const manual = draft.manualProjects.map((project) => ({
    name: project.name,
    summary: project.summary,
    type: project.type,
    status: project.status,
    techStack: project.techStack,
    highlights: project.highlights,
    role: project.role,
    repoUrl: project.repoUrl,
    demoUrl: project.demoUrl,
    imageUrl: project.imageUrl,
    featured: project.featured,
    showInReadme: project.visibility.readme,
    showInPages: project.visibility.pages
  }));
  const manualNames = new Set(manual.map((project) => project.name.toLowerCase()));
  const githubProjects = dataset.repositories
    .filter((repo) => !repo.isPrivate && !manualNames.has(repo.name.toLowerCase()))
    .slice(0, 6)
    .map((repo) => ({
      name: repo.name,
      summary: repo.description || "GitHub repository imported during new-user upgrade.",
      type: "open-source" as const,
      status: "maintained" as const,
      techStack: [repo.language, ...repo.topics].filter(Boolean) as string[],
      highlights: [`${repo.stars} stars`, `${repo.forks} forks`],
      role: "Maintainer",
      repoUrl: `https://github.com/${repo.fullName}`,
      demoUrl: repo.homepage,
      imageUrl: undefined,
      featured: repo.stars > 0,
      showInReadme: true,
      showInPages: true
    }));
  return [...manual, ...githubProjects];
}

function pickPersonalInfo(draft: NewUserFormDraft) {
  return {
    basics: draft.basics,
    education: draft.education,
    learning: draft.learning,
    contact: draft.contact,
    privacy: draft.privacy
  };
}

function buildUpgradeDiff(draft: NewUserFormDraft, dataset: GitHubDataset, targetMode: string, mergedProjects: ManualProject[]) {
  return [
    { field: "mode", before: "new-user", after: targetMode },
    { field: "manualProjects", before: draft.manualProjects.length, after: mergedProjects.length },
    { field: "githubStats", before: "hidden or weak", after: `${dataset.profile.publicRepos} repos, ${dataset.contributions.totalContributions} contributions, ${dataset.totalStars} stars` }
  ];
}
