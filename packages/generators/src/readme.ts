import type { GeneratedReadme, GitHubDataset, LocalizedText, ProfileStudioConfig, Repository } from "@gps/core";
import { localeNumber } from "@gps/core";
import { checkReadmeCompatibility } from "./readme-compatibility";
import { readmeModuleCatalog } from "./readme-modules";

const cardBaseUrl = "https://github-profile-studio.vercel.app";

const moduleLabels: Record<string, LocalizedText> = Object.fromEntries(readmeModuleCatalog.map((module) => [module.id, module.label]));
moduleLabels.education = { en: "Education", zh: "教育背景" };
moduleLabels["learning-plan"] = { en: "Learning Plan", zh: "学习计划" };
moduleLabels["github-growth"] = moduleLabels["github-overview"];

export function generateReadme(config: ProfileStudioConfig): GeneratedReadme {
  const sections = config.enabledReadmeModules
    .map((module) => renderModule(module, config))
    .filter((value): value is string => Boolean(value));
  const markdown = sections.join("\n\n");

  return {
    markdown,
    modules: config.enabledReadmeModules.map((id) => ({
      id,
      label: moduleLabels[id] ?? { en: id, zh: id },
      acceptanceIds: mapReadmeAcceptance(id)
    })),
    warnings: [...buildReadmeWarnings(config), ...checkReadmeCompatibility(markdown, config).map((issue) => issue.message)]
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
    case "github-overview":
      return renderGitHubOverview(config);
    case "streak":
      return renderStreak(config);
    case "contribution-calendar":
      return renderContributionCalendar(config);
    case "languages":
      return renderLanguages(config);
    case "star-growth":
      return renderStarGrowth(config);
    case "pr-issue":
      return renderPrIssue(config);
    case "achievements":
      return renderAchievements(config);
    case "contact":
      return renderContact(config);
    case "blog":
      return renderBlog(config);
    case "visitors":
      return renderVisitors(config);
    case "custom":
      return renderCustom(config);
    default:
      return null;
  }
}

function renderIntro(config: ProfileStudioConfig): string {
  const name = config.profile.displayName || config.targetUsername;
  const role = config.profile.currentRole || "Developer";
  const bio = config.profile.bio || "I am building my technical portfolio and learning in public.";
  const status = config.profile.status ?? "Learning and building projects";

  if (config.locale === "zh-CN") {
    return `# 你好，我是 ${name}\n\n${bio}\n\n- 当前身份: ${role}\n- 当前状态: ${status}\n- GitHub: [@${config.targetUsername}](https://github.com/${config.targetUsername})`;
  }

  if (config.locale === "bilingual") {
    return `# Hi, I'm ${name}\n# 你好，我是 ${name}\n\n${bio}\n\n- Current role: ${role}\n- 当前身份: ${role}\n- Status: ${status}\n- 当前状态: ${status}\n- GitHub: [@${config.targetUsername}](https://github.com/${config.targetUsername})`;
  }

  return `# Hi, I'm ${name}\n\n${bio}\n\n- Current role: ${role}\n- Status: ${status}\n- GitHub: [@${config.targetUsername}](https://github.com/${config.targetUsername})`;
}

function renderEducation(config: ProfileStudioConfig): string | null {
  const visible = config.education.filter((item) => item.showInReadme);
  if (visible.length === 0) return null;
  const body = visible
    .map((item) => {
      const courses = item.courses.length > 0 ? `\n  - Courses: ${item.courses.join(", ")}` : "";
      const honors = item.honors.length > 0 ? `\n  - Honors: ${item.honors.join(", ")}` : "";
      return `- ${item.degree ?? "Student"} in ${item.major ?? "Computer Science"} at ${item.school ?? "my university"}${courses}${honors}`;
    })
    .join("\n");
  return `## ${heading("education", config)}\n\n${body}`;
}

function renderSkills(config: ProfileStudioConfig): string {
  const skills = config.skills.filter((skill) => skill.showInReadme);
  const badges = skills.map((skill) => `![${skill.name}](https://img.shields.io/badge/${encodeURIComponent(skill.name)}-${skill.proficiency}%25-blue)`);
  const primary = skills.filter((skill) => skill.status === "primary" || skill.status === "daily-use").map((skill) => `- ${skill.name}: ${skill.status}, ${skill.proficiency}%`);
  return `## ${heading("skills", config)}\n\n${badges.join(" ") || "Learning the fundamentals and adding skills as I grow."}\n\n${primary.join("\n") || "- Building a practical technical foundation."}`;
}

function renderLearningPlan(config: ProfileStudioConfig): string | null {
  if (!config.learningPlan.showInReadme) return null;
  const focus = list(config.learningPlan.currentFocus, "Build a strong software foundation");
  const goals = list(config.learningPlan.shortTermGoals, "Publish my first polished GitHub project");
  const longTerm = list(config.learningPlan.longTermGoals, "Grow into a reliable open-source contributor");
  return `## ${heading("learning-plan", config)}\n\n### Current focus\n${focus}\n\n### Near-term goals\n${goals}\n\n### Long-term direction\n${longTerm}\n\n${config.learningPlan.openSourcePlan ? `Open-source plan: ${config.learningPlan.openSourcePlan}` : "Open-source plan: start small, document progress, and contribute consistently."}`;
}

function renderProjects(config: ProfileStudioConfig): string {
  const manual = config.manualProjects.filter((project) => project.showInReadme);
  const repos = visibleRepos(config.github).slice(0, 5);
  const manualLines = manual.map((project) => {
    const links = [project.repoUrl ? `[repo](${project.repoUrl})` : "", project.demoUrl ? `[demo](${project.demoUrl})` : ""].filter(Boolean).join(" ");
    return `- **${project.name}**: ${project.summary} (${project.techStack.join(", ") || "learning project"})${links ? ` ${links}` : ""}`;
  });
  const repoLines = repos.map((repo) => `- **[${repo.name}](https://github.com/${repo.fullName})**: ${repo.description ?? "A GitHub project"} - ${localeNumber(repo.stars, config.locale)} stars / ${localeNumber(repo.forks, config.locale)} forks`);
  const lines = [...manualLines, ...repoLines];
  return `## ${heading("projects", config)}\n\n${lines.join("\n") || "- Project plans are being prepared and will be published soon."}`;
}

function renderGitHubOverview(config: ProfileStudioConfig): string | null {
  const data = config.github;
  if (!data) return null;
  if (isSparse(data)) {
    return `## ${heading("github-overview", config)}\n\nI am at the beginning of my GitHub journey, so this section focuses on learning goals instead of empty statistics.`;
  }
  const accountAge = data.profile.accountAgeYears ? `${data.profile.accountAgeYears.toFixed(1)} years` : data.profile.createdAt ? "Tracked from profile creation date" : "New account";
  const impactScore = data.totalStars * 2 + data.totalForks + data.pullRequests.total + data.issues.closed;
  return `## ${heading("github-overview", config)}\n\n- Contributions this year: ${localeNumber(data.contributions.totalContributions, config.locale)}\n- Commits: ${localeNumber(data.contributions.commitContributions, config.locale)}\n- Pull requests: ${localeNumber(data.pullRequests.total, config.locale)}\n- Issues: ${localeNumber(data.issues.total, config.locale)}\n- Public repositories: ${localeNumber(data.profile.publicRepos, config.locale)}\n- Followers: ${localeNumber(data.profile.followers, config.locale)}\n- Total stars: ${localeNumber(data.totalStars, config.locale)}\n- Total forks: ${localeNumber(data.totalForks, config.locale)}\n- Account age: ${accountAge}\n- Open-source impact score: ${localeNumber(impactScore, config.locale)}`;
}

function renderStreak(config: ProfileStudioConfig): string | null {
  const data = config.github;
  if (!data || isSparse(data)) return emptyDataCopy("streak", config);
  const activeDays = data.contributions.contributionDays.filter((day) => day.count > 0).length;
  return `## ${heading("streak", config)}\n\n![GitHub streak](${cardUrl("streak", config)})\n\n- Current streak: ${localeNumber(data.contributions.currentStreak, config.locale)} days\n- Longest streak: ${localeNumber(data.contributions.longestStreak, config.locale)} days\n- Active days this year: ${localeNumber(activeDays, config.locale)}`;
}

function renderContributionCalendar(config: ProfileStudioConfig): string | null {
  const data = config.github;
  if (!data || data.contributions.totalContributions === 0) return emptyDataCopy("contribution-calendar", config);
  const levels = [0, 1, 2, 3, 4].map((level) => `${level}: ${data.contributions.contributionDays.filter((day) => day.level === level).length}`).join(" / ");
  return `## ${heading("contribution-calendar", config)}\n\n![Contribution calendar](${cardUrl("contribution-calendar", config)})\n\nContribution levels: ${levels}`;
}

function renderLanguages(config: ProfileStudioConfig): string {
  const data = config.github;
  const languages = data ? Object.entries(data.languages.byBytes).slice(0, 6) : [];
  if (languages.length === 0) {
    const manual = config.skills.filter((skill) => skill.category === "language").map((skill) => `- ${skill.name}: ${skill.status}`);
    return `## ${heading("languages", config)}\n\n${manual.join("\n") || "- Main languages are being selected while projects are still growing."}`;
  }
  const total = languages.reduce((sum, [, bytes]) => sum + bytes, 0);
  return `## ${heading("languages", config)}\n\n![Top languages](${cardUrl("languages", config)})\n\n${languages.map(([name, bytes]) => `- ${name}: ${percentage(bytes, total)} by bytes`).join("\n")}`;
}

function renderStarGrowth(config: ProfileStudioConfig): string | null {
  const data = config.github;
  if (!data || data.totalStars === 0) return emptyDataCopy("star-growth", config);
  const repos = topRepos(data.repositories, "stars", 5).map((repo) => `- ${repo.fullName}: ${localeNumber(repo.stars, config.locale)} stars`);
  return `## ${heading("star-growth", config)}\n\n![Star growth](${cardUrl("star-growth", config)})\n\n${repos.join("\n")}`;
}

function renderPrIssue(config: ProfileStudioConfig): string | null {
  const data = config.github;
  if (!data || (data.pullRequests.total === 0 && data.issues.total === 0)) return emptyDataCopy("pr-issue", config);
  return `## ${heading("pr-issue", config)}\n\n![PR and Issue stats](${cardUrl("pr-issue", config)})\n\n- Pull requests: ${localeNumber(data.pullRequests.total, config.locale)} (${localeNumber(data.pullRequests.mergeRate, config.locale)}% merged)\n- Reviews: ${localeNumber(data.pullRequests.reviewed, config.locale)}\n- Issues: ${localeNumber(data.issues.total, config.locale)} (${localeNumber(data.issues.closeRate, config.locale)}% closed)\n- External repositories: ${localeNumber(data.pullRequests.externalRepositories, config.locale)}`;
}

function renderAchievements(config: ProfileStudioConfig): string {
  return `## ${heading("achievements", config)}\n\n![Achievements](${cardUrl("achievements", config)})\n\nAchievement badges update as GitHub data grows.`;
}

function renderContact(config: ProfileStudioConfig): string {
  const links = config.socialLinks
    .filter((link) => link.showInReadme)
    .map((link) => `- [${link.label}](${link.url})`)
    .join("\n");
  return `## ${heading("contact", config)}\n\n${links || "- Contact links are hidden by privacy settings."}`;
}

function renderBlog(config: ProfileStudioConfig): string | null {
  const blog = config.profile.blog || config.socialLinks.find((link) => /blog|rss/i.test(link.provider))?.url;
  if (!blog) return `## ${heading("blog", config)}\n\nBlog feed automation is ready. Add an RSS source to publish recent posts here.`;
  return `## ${heading("blog", config)}\n\n- Latest posts are synced from [my blog](${blog}).\n- The generated GitHub Actions workflow can refresh this list on schedule.`;
}

function renderVisitors(config: ProfileStudioConfig): string {
  return `## ${heading("visitors", config)}\n\n![Profile views](https://komarev.com/ghpvc/?username=${encodeURIComponent(config.targetUsername)}&style=flat-square)`;
}

function renderCustom(config: ProfileStudioConfig): string {
  return `## ${heading("custom", config)}\n\n<!-- profile-studio:custom:start -->\nAdd custom Markdown, HTML-compatible snippets, images, badges, or third-party cards here.\n<!-- profile-studio:custom:end -->`;
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
    "learning-plan": ["N-README-006", "N-README-009", "N-README-011"],
    projects: ["04-011", "N-README-010"],
    "github-growth": ["04-007", "N-README-013", "N-README-014", "N-README-015"],
    "github-overview": ["04-007", "N-README-013", "N-README-014", "N-README-015"],
    streak: ["04-008"],
    "contribution-calendar": ["04-009", "N-README-016"],
    languages: ["04-010", "N-README-007"],
    "star-growth": ["04-012"],
    "pr-issue": ["04-013"],
    achievements: ["04-015"],
    contact: ["04-016", "N-README-012"],
    blog: ["04-017"],
    visitors: ["04-018", "N-README-017"],
    custom: ["04-019"]
  };
  return map[id] ?? [];
}

function emptyDataCopy(module: string, config: ProfileStudioConfig): string {
  return `## ${heading(module, config)}\n\nThis section is ready and will become data-rich as repositories, commits, pull requests, and issues grow.`;
}

function heading(id: string, config: ProfileStudioConfig): string {
  const label = moduleLabels[id] ?? { en: id, zh: id };
  if (config.locale === "zh-CN") return label.zh;
  if (config.locale === "bilingual") return `${label.en} / ${label.zh}`;
  return label.en;
}

function cardUrl(type: string, config: ProfileStudioConfig): string {
  return `${cardBaseUrl}/api/cards/${encodeURIComponent(type)}?user=${encodeURIComponent(config.targetUsername)}&theme=${encodeURIComponent(config.themeKey)}&locale=${encodeURIComponent(config.locale)}&format=svg`;
}

function visibleRepos(data?: GitHubDataset): Repository[] {
  return data?.repositories.filter((repo) => !repo.isPrivate && !repo.isArchived) ?? [];
}

function topRepos(repositories: Repository[], key: "stars" | "forks", limit: number): Repository[] {
  return [...repositories].filter((repo) => !repo.isPrivate && !repo.isArchived).sort((a, b) => b[key] - a[key]).slice(0, limit);
}

function isSparse(data: GitHubDataset): boolean {
  return data.profile.publicRepos === 0 && data.totalStars === 0 && data.contributions.totalContributions === 0;
}

function list(items: string[], fallback: string): string {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : `- ${fallback}`;
}

function percentage(value: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}
