import type { GitHubDataset } from "./domain";
import type { NewUserFormDraft } from "./new-user-form";
import { newUserFormDraftSchema } from "./new-user-form";

export type NewUserLayoutPlan = {
  educationLayout: "empty" | "single-card" | "timeline";
  courseLayout: "hidden" | "tag-list" | "grouped-list";
  projectLayout: "empty-state" | "single-feature" | "project-grid" | "bento-grid";
  learningPlanLayout: "compact-list" | "roadmap" | "timeline";
  jobStatusLayout: "hidden" | "resume-callout" | "application-ready";
  learningStatusLayout: "student" | "self-taught" | "career-switcher" | "builder";
  openSourceNewcomerLayout: boolean;
  githubDataEmphasis: "manual-first" | "balanced" | "data-rich";
  defaultAvatar: string;
  defaultProjectCovers: Array<{ projectName: string; coverKey: string; alt: string }>;
  copyCompletion: Array<{ field: string; suggestion: string }>;
  acceptanceIds: string[];
};

export function planNewUserLayout(input: NewUserFormDraft, dataset?: GitHubDataset): NewUserLayoutPlan {
  const draft = newUserFormDraftSchema.parse(input);
  const repoCount = dataset?.profile.publicRepos ?? 0;
  const contributions = dataset?.contributions.totalContributions ?? 0;
  const stars = dataset?.totalStars ?? 0;
  const pullRequests = dataset?.pullRequests.total ?? 0;
  const issueCount = dataset?.issues.total ?? 0;
  const courses = draft.education.flatMap((item) => item.courses);
  const jobPlan = Boolean(draft.learning.jobPlan || draft.contact.showResume || /intern|job|求职|实习/i.test(`${draft.basics.status} ${draft.basics.currentRole}`));

  return {
    educationLayout: draft.education.length === 0 ? "empty" : draft.education.length === 1 ? "single-card" : "timeline",
    courseLayout: courses.length === 0 ? "hidden" : courses.length <= 6 ? "tag-list" : "grouped-list",
    projectLayout: draft.manualProjects.length === 0 ? "empty-state" : draft.manualProjects.length === 1 ? "single-feature" : draft.manualProjects.length <= 4 ? "project-grid" : "bento-grid",
    learningPlanLayout: draft.learning.longTermGoals.length > 1 ? "timeline" : draft.learning.currentFocus.length + draft.learning.shortTermGoals.length > 4 ? "roadmap" : "compact-list",
    jobStatusLayout: jobPlan ? (draft.contact.showResume ? "application-ready" : "resume-callout") : "hidden",
    learningStatusLayout: inferLearningStatus(draft),
    openSourceNewcomerLayout: pullRequests + issueCount < 3,
    githubDataEmphasis: repoCount < 3 || contributions < 30 || stars < 5 ? "manual-first" : repoCount < 8 ? "balanced" : "data-rich",
    defaultAvatar: draft.basics.avatarUrl || `https://github.com/identicons/${encodeURIComponent(draft.username)}.png`,
    defaultProjectCovers: draft.manualProjects.map((project, index) => ({
      projectName: project.name,
      coverKey: project.imageUrl ? "user-provided" : `${project.type}-${index + 1}`,
      alt: project.imageUrl ? `${project.name} screenshot` : `${project.name} generated project cover`
    })),
    copyCompletion: buildCopyCompletion(draft),
    acceptanceIds: [
      "N-LAYOUT-001",
      "N-LAYOUT-002",
      "N-LAYOUT-003",
      "N-LAYOUT-004",
      "N-LAYOUT-005",
      "N-LAYOUT-006",
      "N-LAYOUT-007",
      "N-LAYOUT-008",
      "N-LAYOUT-009",
      "N-LAYOUT-010",
      "N-LAYOUT-011"
    ]
  };
}

function inferLearningStatus(draft: NewUserFormDraft): NewUserLayoutPlan["learningStatusLayout"] {
  const text = `${draft.basics.currentRole} ${draft.basics.status}`.toLowerCase();
  if (/switch|转码/.test(text)) return "career-switcher";
  if (/self|自学/.test(text)) return "self-taught";
  if (/student|学生|university|college/.test(text)) return "student";
  return "builder";
}

function buildCopyCompletion(draft: NewUserFormDraft): NewUserLayoutPlan["copyCompletion"] {
  const suggestions: NewUserLayoutPlan["copyCompletion"] = [];
  if (!draft.basics.oneLineIntro) suggestions.push({ field: "oneLineIntro", suggestion: "Add a one-line intro so the hero does not feel empty." });
  if (draft.learning.currentFocus.length === 0) suggestions.push({ field: "currentFocus", suggestion: "Add current learning focus areas." });
  if (draft.manualProjects.length === 0) suggestions.push({ field: "manualProjects", suggestion: "Add at least one manual project or planned project." });
  if (draft.skills.length === 0 && draft.languages.length === 0) suggestions.push({ field: "skills", suggestion: "Add languages or skills to avoid an empty skill section." });
  return suggestions;
}
