import type { GitHubDataset } from "./domain";
import type { NewUserFormDraft } from "./new-user-form";
import { newUserFormDraftSchema } from "./new-user-form";
import { defaultPageVisualConfig } from "./page-visual";
import { builtinPageTemplates, builtinReadmeTemplates, builtinThemePresets } from "./templates";

export function buildNewUserRecommendations(input: NewUserFormDraft, dataset?: GitHubDataset) {
  const draft = newUserFormDraftSchema.parse(input);
  const lowData = !dataset || dataset.profile.publicRepos < 3 || dataset.contributions.totalContributions < 30 || dataset.totalStars < 5;
  const resumeMode = draft.contact.showResume || /intern|job|求职|实习/i.test(`${draft.basics.currentRole} ${draft.basics.status} ${draft.learning.jobPlan}`);
  const readmeTemplate = resumeMode ? "technical-resume" : lowData ? "student-developer" : "bilingual";
  const pageTemplate = resumeMode ? "job-resume" : lowData ? "student-portfolio" : "personal-brand";
  const skills = [...draft.languages.map((language) => language.name), ...draft.skills.map((skill) => skill.name)];
  const projects = [...draft.manualProjects].sort((a, b) => Number(b.featured) - Number(a.featured) || b.techStack.length - a.techStack.length);

  return {
    readmeTemplate: builtinReadmeTemplates.find((template) => template.key === readmeTemplate) ?? builtinReadmeTemplates[0],
    readmeModules: lowData
      ? ["intro", "education", "skills", "learning-plan", "projects", "achievements", "contact", "custom"]
      : ["intro", "github-overview", "streak", "contribution-calendar", "languages", "star-growth", "pr-issue", "achievements", "projects", "contact"],
    skillOrder: skills.sort((a, b) => scoreSkill(b, draft) - scoreSkill(a, draft)),
    projectOrder: projects.map((project) => project.name),
    pageTemplate: builtinPageTemplates.find((template) => template.key === pageTemplate) ?? builtinPageTemplates[0],
    homeSectionOrder: lowData
      ? ["hero", "about", "education", "skills", "learning-directions", "learning-plan", "projects", "future-goals", "contact"]
      : ["hero", "about", "github", "projects", "achievements", "skills", "timeline", "contact"],
    seo: defaultPageVisualConfig(draft).seo,
    theme: recommendTheme(draft, resumeMode, lowData),
    acceptanceIds: ["N-REC-001", "N-REC-002", "N-REC-003", "N-REC-004", "N-REC-005", "N-REC-006", "N-REC-007", "N-REC-008"]
  };
}

function scoreSkill(skill: string, draft: NewUserFormDraft): number {
  const language = draft.languages.find((item) => item.name === skill);
  if (language) return language.proficiency + (language.isPrimary ? 30 : 0) + (language.isDailyUse ? 15 : 0);
  const found = draft.skills.find((item) => item.name === skill);
  return found ? found.proficiency + (found.status === "primary" ? 30 : found.status === "daily-use" ? 15 : 0) : 0;
}

function recommendTheme(draft: NewUserFormDraft, resumeMode: boolean, lowData: boolean) {
  const key = resumeMode ? "technical-resume" : lowData ? "github-native" : draft.locale === "zh-CN" ? "developer-portfolio" : "dashboard-pro";
  return builtinThemePresets.find((theme) => theme.key === key) ?? builtinThemePresets[0];
}
