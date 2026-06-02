import type { GitHubDetectionResult, RepositoryStatus } from "./client";

export type DetectionStatusCard = {
  id: string;
  label: string;
  status: "success" | "warning" | "missing";
  detail: string;
  acceptanceIds: string[];
};

export function buildDetectionStatusCards(result: GitHubDetectionResult): DetectionStatusCard[] {
  return [
    {
      id: "user",
      label: "GitHub account",
      status: result.userExists ? "success" : "missing",
      detail: result.userExists ? `${result.username} exists as ${result.userType ?? "User"}.` : "User was not found.",
      acceptanceIds: ["02-004", "02-005", "02-006", "03-001"]
    },
    repositoryCard("profile-readme", "Profile README repository", result.profileReadmeRepository, ["02-009", "02-010", "02-011"]),
    repositoryCard("pages", "GitHub Pages repository", result.pagesRepository, ["02-012", "02-013", "02-014"]),
    {
      id: "next-actions",
      label: "Recommended next actions",
      status: result.nextActions.length > 0 ? "warning" : "success",
      detail: result.nextActions.join(" ") || "No blocking setup actions detected.",
      acceptanceIds: ["02-016"]
    }
  ];
}

function repositoryCard(id: string, label: string, repo: RepositoryStatus, acceptanceIds: string[]): DetectionStatusCard {
  if (!repo.exists) {
    return { id, label, status: "missing", detail: `${label} does not exist yet.`, acceptanceIds };
  }
  const warnings = [
    repo.isPublic ? "" : "Repository is not public.",
    repo.hasReadme ? "" : "README.md is missing.",
    id === "pages" && !repo.pages?.enabled ? "GitHub Pages is not enabled." : "",
    id === "pages" && repo.pages?.enabled ? `Pages source: ${repo.pages.branch ?? repo.defaultBranch ?? "main"}${repo.pages.path ?? "/"}.` : ""
  ].filter(Boolean);
  return {
    id,
    label,
    status: warnings.length > 0 ? "warning" : "success",
    detail: warnings.join(" ") || `${label} is ready on ${repo.defaultBranch ?? "default branch"}.`,
    acceptanceIds
  };
}
