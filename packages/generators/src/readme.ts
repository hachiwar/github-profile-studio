import type { GeneratedReadme, ProfileStudioConfig } from "@gps/core";
import { localize, localeNumber } from "@gps/core";
import { checkReadmeCompatibility } from "./readme-compatibility";

const moduleLabels = {
  intro: { en: "Introduction", zh: "个人介绍" },
  education: { en: "Education", zh: "教育背景" },
  skills: { en: "Tech Stack", zh: "技术栈" },
  "learning-plan": { en: "Learning Plan", zh: "学习计划" },
  projects: { en: "Projects", zh: "项目与作品" },
  "github-growth": { en: "GitHub Growth", zh: "GitHub 成长数据" },
  contact: { en: "Contact", zh: "联系方式" }
};

export function generateReadme(config: ProfileStudioConfig): GeneratedReadme {
  const sections = config.enabledReadmeModules
    .map((module) => renderModule(module, config))
    .filter((value): value is string => Boolean(value));

  return {
    markdown: sections.join("\n\n"),
    modules: config.enabledReadmeModules.map((id) => ({
      id,
      label: moduleLabels[id as keyof typeof moduleLabels] ?? { en: id, zh: id },
      acceptanceIds: mapReadmeAcceptance(id)
    })),
    warnings: [
      ...buildReadmeWarnings(config),
      ...checkReadmeCompatibility(sections.join("\n\n"), config).map((issue) => issue.message)
    ]
  };
}

function renderModule(module: string, config: ProfileStudioConfig): string | null {
  switch (module) {
    case "intro":
      return renderIntro(config);
    case "education":
      return renderEducation(config);
    case "skills":
      return renderSkills(config);
    case "learning-plan":
      return renderLearningPlan(config);
    case "projects":
      return renderProjects(config);
    case "github-growth":
      return renderGitHubGrowth(config);
    case "contact":
      return renderContact(config);
    default:
      return null;
  }
}

function renderIntro(config: ProfileStudioConfig): string {
  const name = config.profile.displayName || config.targetUsername;
  const role = config.profile.currentRole || "Developer";
  const bio = config.profile.bio || "I am building my technical portfolio and learning in public.";

  if (config.locale === "zh-CN") {
    return `# Hi, I'm ${name}\n\n${bio}\n\n- Current role: ${role}\n- Status: ${config.profile.status ?? "Learning and building projects"}\n- GitHub: [@${config.targetUsername}](https://github.com/${config.targetUsername})`;
  }

  if (config.locale === "bilingual") {
    return `# Hi, I'm ${name}\n# 你好，我是 ${name}\n\n${bio}\n\n- Current role: ${role}\n- 当前身份：${role}\n- Status: ${config.profile.status ?? "Learning and building projects"}\n- GitHub: [@${config.targetUsername}](https://github.com/${config.targetUsername})`;
  }

  return `# Hi, I'm ${name}\n\n${bio}\n\n- Current role: ${role}\n- Status: ${config.profile.status ?? "Learning and building projects"}\n- GitHub: [@${config.targetUsername}](https://github.com/${config.targetUsername})`;
}

function renderEducation(config: ProfileStudioConfig): string | null {
  const visible = config.education.filter((item) => item.showInReadme);
  if (visible.length === 0) return null;
  const body = visible
    .map((item) => {
      const courses = item.courses.length > 0 ? `\n  - Courses: ${item.courses.join(", ")}` : "";
      return `- ${item.degree ?? "Student"} in ${item.major ?? "Computer Science"} at ${item.school ?? "my university"}${courses}`;
    })
    .join("\n");
  return `## ${localize(moduleLabels.education, config.locale)}\n\n${body}`;
}

function renderSkills(config: ProfileStudioConfig): string {
  const skills = config.skills.filter((skill) => skill.showInReadme);
  const lines = skills.map((skill) => `![${skill.name}](https://img.shields.io/badge/${encodeURIComponent(skill.name)}-${skill.proficiency}%25-blue)`);
  return `## ${localize(moduleLabels.skills, config.locale)}\n\n${lines.join(" ") || "Learning the fundamentals and adding skills as I grow."}`;
}

function renderLearningPlan(config: ProfileStudioConfig): string | null {
  if (!config.learningPlan.showInReadme) return null;
  const focus = config.learningPlan.currentFocus.map((item) => `- ${item}`).join("\n");
  const goals = config.learningPlan.shortTermGoals.map((item) => `- ${item}`).join("\n");
  return `## ${localize(moduleLabels["learning-plan"], config.locale)}\n\n### Current focus\n${focus || "- Build a strong software foundation"}\n\n### Near-term goals\n${goals || "- Publish my first polished GitHub project"}`;
}

function renderProjects(config: ProfileStudioConfig): string {
  const manual = config.manualProjects.filter((project) => project.showInReadme);
  const repos = config.github?.repositories ?? [];
  const manualLines = manual.map((project) => `- **${project.name}**: ${project.summary} (${project.techStack.join(", ")})`);
  const repoLines = repos.slice(0, 3).map((repo) => `- **[${repo.name}](https://github.com/${repo.fullName})**: ${repo.description ?? "A GitHub project"} - ${localeNumber(repo.stars, config.locale)} stars`);
  const lines = [...manualLines, ...repoLines];
  return `## ${localize(moduleLabels.projects, config.locale)}\n\n${lines.join("\n") || "- Project plans are being prepared and will be published soon."}`;
}

function renderGitHubGrowth(config: ProfileStudioConfig): string | null {
  const data = config.github;
  if (!data) return null;
  const isSparse = data.profile.publicRepos === 0 && data.totalStars === 0 && data.contributions.totalContributions === 0;
  if (isSparse) {
    return `## ${localize(moduleLabels["github-growth"], config.locale)}\n\nI am at the beginning of my GitHub journey, so this section focuses on learning goals instead of empty statistics.`;
  }
  return `## ${localize(moduleLabels["github-growth"], config.locale)}\n\n- Contributions this year: ${localeNumber(data.contributions.totalContributions, config.locale)}\n- Public repositories: ${localeNumber(data.profile.publicRepos, config.locale)}\n- Total stars: ${localeNumber(data.totalStars, config.locale)}\n- Current streak: ${localeNumber(data.contributions.currentStreak, config.locale)} days`;
}

function renderContact(config: ProfileStudioConfig): string {
  const links = config.socialLinks
    .filter((link) => link.showInReadme)
    .map((link) => `- [${link.label}](${link.url})`)
    .join("\n");
  return `## ${localize(moduleLabels.contact, config.locale)}\n\n${links || "- Contact links are hidden by privacy settings."}`;
}

function buildReadmeWarnings(config: ProfileStudioConfig): string[] {
  const warnings: string[] = [];
  if ((config.github?.profile.publicRepos ?? 0) === 0) warnings.push("GitHub repository data is empty; new-user modules are prioritized.");
  if ((config.github?.totalStars ?? 0) === 0) warnings.push("Star modules should stay hidden or use growth-oriented copy.");
  if ((config.github?.pullRequests.total ?? 0) === 0) warnings.push("PR modules should use open-source learning copy instead of empty stats.");
  return warnings;
}

function mapReadmeAcceptance(id: string): string[] {
  const map: Record<string, string[]> = {
    intro: ["04-006", "N-README-003", "N-README-004"],
    education: ["N-README-005"],
    skills: ["04-014", "N-README-007", "N-README-008"],
    "learning-plan": ["N-README-009", "N-README-011"],
    projects: ["04-011", "N-README-010"],
    "github-growth": ["04-007", "N-README-013", "N-README-014"],
    contact: ["04-016", "N-README-012"]
  };
  return map[id] ?? [];
}
