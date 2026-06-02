import { builtinPageTemplates, builtinReadmeTemplates } from "./templates";
import { defaultNewUserFormDraft, splitList, type NewUserFormDraft } from "./new-user-form";
import { createNewUserSavedSnapshot, exportNewUserConfiguration, restoreNewUserSnapshot, type NewUserSavedSnapshot } from "./new-user-persistence";

export type NewUserImportResult = {
  draft: NewUserFormDraft;
  sourceType: "readme" | "resume-text" | "project-readme" | "bulk-projects" | "bulk-skills" | "config-json";
  detected: string[];
  warnings: string[];
  acceptanceIds: string[];
};

export function importNewUserFromReadme(markdown: string, username = "imported-user"): NewUserImportResult {
  const draft = defaultNewUserFormDraft(username, "en-US");
  const headings = [...markdown.matchAll(/^#{1,3}\s+(.+)$/gm)].map((match) => match[1].trim());
  const links = [...markdown.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)].map((match) => ({ label: match[1], url: match[2] }));
  const badges = [...markdown.matchAll(/badge\/([^-\s]+)-/g)].map((match) => decodeURIComponent(match[1]));
  const intro = markdown.split(/\r?\n/).find((line) => line.trim() && !line.startsWith("#") && !line.startsWith("!"));

  draft.basics.oneLineIntro = intro || draft.basics.oneLineIntro;
  draft.skills = badges.slice(0, 12).map((name) => ({ name, category: "other", proficiency: 40, status: "learning", showIcon: true, showBadge: true, visibility: { readme: true, pages: true } }));
  draft.basics.socialLinks = links.slice(0, 8).map((link) => ({ provider: link.label, label: link.label, url: link.url, visibility: { readme: true, pages: true } }));

  return {
    draft,
    sourceType: "readme",
    detected: ["headings", "links", "badges"].filter((kind) => (kind === "headings" ? headings.length : kind === "links" ? links.length : badges.length) > 0),
    warnings: headings.length === 0 ? ["README headings were not detected; using default new-user sections."] : [],
    acceptanceIds: ["N-IMP-001"]
  };
}

export function importNewUserFromResumeText(text: string, username = "resume-user"): NewUserImportResult {
  const draft = defaultNewUserFormDraft(username, "en-US");
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  const urls = [...text.matchAll(/https?:\/\/\S+/g)].map((match) => match[0].replace(/[),.;]+$/, ""));
  const skillLine = text.split(/\r?\n/).find((line) => /skills?|技术栈/i.test(line));
  const educationLine = text.split(/\r?\n/).find((line) => /university|college|school|大学|学院/i.test(line));

  draft.basics.email = email;
  draft.basics.website = urls[0];
  if (educationLine) draft.education[0] = { ...draft.education[0], school: educationLine.trim() };
  if (skillLine) {
    draft.skills = splitList(skillLine.replace(/skills?|技术栈/gi, "")).map((name) => ({ name, category: "other", proficiency: 50, status: "learning", showIcon: true, showBadge: true, visibility: { readme: true, pages: true } }));
  }

  return {
    draft,
    sourceType: "resume-text",
    detected: [email ? "email" : "", urls.length ? "links" : "", skillLine ? "skills" : "", educationLine ? "education" : ""].filter(Boolean),
    warnings: [],
    acceptanceIds: ["N-IMP-002"]
  };
}

export function importProjectsFromReadmes(projectReadmes: Array<{ name: string; markdown: string }>, username = "project-user"): NewUserImportResult {
  const draft = defaultNewUserFormDraft(username, "en-US");
  draft.manualProjects = projectReadmes.map((project) => ({
    name: project.name,
    summary: firstParagraph(project.markdown) || "Imported project README.",
    type: /course|课程/i.test(project.markdown) ? "course" : "personal",
    status: /complete|完成|released/i.test(project.markdown) ? "completed" : "building",
    techStack: extractSkills(project.markdown).slice(0, 8),
    highlights: extractBullets(project.markdown).slice(0, 5),
    role: "Developer",
    repoUrl: undefined,
    demoUrl: undefined,
    imageUrl: undefined,
    videoUrl: undefined,
    featured: true,
    visibility: { readme: true, pages: true }
  }));

  return {
    draft,
    sourceType: projectReadmes.length === 1 ? "project-readme" : "bulk-projects",
    detected: ["projects", "techStack", "highlights"],
    warnings: projectReadmes.length === 0 ? ["No project README content was provided."] : [],
    acceptanceIds: projectReadmes.length === 1 ? ["N-IMP-003"] : ["N-IMP-004"]
  };
}

export function importSkillsFromText(text: string, username = "skills-user"): NewUserImportResult {
  const draft = defaultNewUserFormDraft(username, "en-US");
  const skills = extractSkills(text);
  draft.skills = skills.map((name) => ({ name, category: "other", proficiency: 45, status: "learning", showIcon: true, showBadge: true, visibility: { readme: true, pages: true } }));
  return {
    draft,
    sourceType: "bulk-skills",
    detected: ["skills"],
    warnings: skills.length === 0 ? ["No recognizable skills were found."] : [],
    acceptanceIds: ["N-IMP-005"]
  };
}

export function exportNewUserDraftConfig(draft: NewUserFormDraft): string {
  return exportNewUserConfiguration(createNewUserSavedSnapshot(draft));
}

export function importNewUserDraftConfig(json: string): NewUserImportResult {
  const parsed = JSON.parse(json) as NewUserSavedSnapshot;
  return {
    draft: restoreNewUserSnapshot(parsed),
    sourceType: "config-json",
    detected: ["schemaVersion", "draft", "pageVisual"],
    warnings: parsed.schemaVersion === 1 ? [] : ["Configuration schema version is newer than this importer."],
    acceptanceIds: ["N-IMP-007"]
  };
}

export function recommendTemplateFromImport(result: NewUserImportResult) {
  const hasResume = Boolean(result.draft.basics.resumeUrl || result.draft.contact.showResume);
  return {
    readmeTemplate: hasResume ? builtinReadmeTemplates.find((template) => template.key === "technical-resume")?.key : result.draft.templateKeys.readme,
    pageTemplate: hasResume ? builtinPageTemplates.find((template) => template.key === "job-resume")?.key : result.draft.templateKeys.pages,
    acceptanceIds: ["N-IMP-006", "N-IMP-007"]
  };
}

function firstParagraph(markdown: string): string {
  return markdown
    .split(/\n\s*\n/)
    .map((part) => part.replace(/^#+\s+.+$/gm, "").trim())
    .find(Boolean) ?? "";
}

function extractBullets(markdown: string): string[] {
  return [...markdown.matchAll(/^\s*[-*]\s+(.+)$/gm)].map((match) => match[1].trim());
}

function extractSkills(text: string): string[] {
  const known = ["TypeScript", "JavaScript", "Python", "React", "Vue", "Next.js", "Node.js", "Java", "Go", "Rust", "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS", "GitHub Actions", "Tailwind CSS"];
  const lower = text.toLowerCase();
  return known.filter((skill) => lower.includes(skill.toLowerCase()));
}
