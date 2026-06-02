import type { GitHubDataset, LocalizedText, ProfileStudioConfig, Repository, RepositoryTrend } from "@gps/core";
import { demoProfileConfig, localeNumber, localize } from "@gps/core";
import { calculateAchievements } from "@gps/achievements";
import { generateReadme } from "./readme";
import { generatePagesSite } from "./pages";
import type { WorkflowConfig, WorkflowModule } from "./actions";
import { defaultWorkflowConfigs, generateWorkflow } from "./actions";

export type SnapshotKind = "star" | "fork";

export type RepositorySnapshot = {
  kind: SnapshotKind;
  username: string;
  repoFullName: string;
  date: string;
  value: number;
  stars: number;
  forks: number;
  watchers: number;
  source: RepositoryTrend["snapshotSource"];
};

export type StarHistoryPoint = {
  username: string;
  repoFullName: string;
  date: string;
  stars: number;
  source: "stargazer-backfill" | "repository-created-at" | "scheduled-snapshot";
  confidence: "exact" | "estimated";
};

export type GrowthRecommendationKind =
  | "new-repository"
  | "commit-growth"
  | "star-growth"
  | "pr-issue-growth"
  | "skill-update"
  | "education-status"
  | "job-status"
  | "monthly-summary"
  | "annual-summary"
  | "auto-optimization";

export type GrowthRecommendation = {
  id: GrowthRecommendationKind;
  acceptanceId: string;
  title: LocalizedText;
  message: LocalizedText;
  priority: "low" | "medium" | "high";
  evidence: Record<string, string | number | boolean>;
  actions: string[];
};

export type MonthlyGrowthSummary = {
  month: string;
  username: string;
  contributions: number;
  commits: number;
  stars: number;
  forks: number;
  pullRequests: number;
  issues: number;
  activeRepositories: number;
  topLanguages: string[];
  delta?: {
    contributions: number;
    stars: number;
    forks: number;
    repositories: number;
  };
};

export type YearInReview = {
  year: number;
  username: string;
  totals: {
    contributions: number;
    commits: number;
    pullRequests: number;
    issues: number;
    reviews: number;
    stars: number;
    forks: number;
    repositories: number;
    followers: number;
  };
  topRepositories: Array<{ fullName: string; stars: number; forks: number; language?: string }>;
  topLanguages: Array<{ name: string; value: number }>;
  unlockedAchievements: number;
  markdown: string;
};

export type MaintenanceFile = {
  path: string;
  contentType: "markdown" | "json" | "yaml" | "html" | "css" | "javascript" | "text";
  content: string;
  reason: string;
  acceptanceIds: string[];
};

export type MaintenanceRunInput = {
  config?: ProfileStudioConfig;
  dataset?: GitHubDataset;
  username?: string;
  modules?: WorkflowModule[];
  workflow?: WorkflowConfig;
  generatedAt?: string;
  previousDataset?: GitHubDataset;
};

export type MaintenanceRun = {
  username: string;
  generatedAt: string;
  modules: WorkflowModule[];
  summary: {
    files: number;
    starSnapshots: number;
    forkSnapshots: number;
    recommendations: number;
    workflows: number;
    acceptanceIds: string[];
  };
  files: MaintenanceFile[];
  snapshots: RepositorySnapshot[];
  starHistory: StarHistoryPoint[];
  monthlySummary: MonthlyGrowthSummary;
  yearInReview: YearInReview;
  recommendations: GrowthRecommendation[];
  logs: Array<{ level: "info" | "warning"; message: string; acceptanceIds: string[] }>;
};

const monthKeys = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function createRepositorySnapshots(dataset: GitHubDataset, date = new Date().toISOString().slice(0, 10)): RepositorySnapshot[] {
  const trends = dataset.repositoryTrends.length > 0 ? dataset.repositoryTrends : buildFallbackTrends(dataset, date);
  return trends.flatMap((trend) => [
    {
      kind: "star" as const,
      username: dataset.profile.githubUsername,
      repoFullName: trend.repoFullName,
      date,
      value: trend.stars,
      stars: trend.stars,
      forks: trend.forks,
      watchers: trend.watchers,
      source: trend.snapshotSource
    },
    {
      kind: "fork" as const,
      username: dataset.profile.githubUsername,
      repoFullName: trend.repoFullName,
      date,
      value: trend.forks,
      stars: trend.stars,
      forks: trend.forks,
      watchers: trend.watchers,
      source: trend.snapshotSource
    }
  ]);
}

export function createStarHistoryBackfill(dataset: GitHubDataset, date = new Date().toISOString().slice(0, 10)): StarHistoryPoint[] {
  return dataset.repositories.filter(isVisibleRepo).flatMap((repo) => {
    const points: StarHistoryPoint[] = [];
    if (repo.createdAt) {
      points.push({
        username: dataset.profile.githubUsername,
        repoFullName: repo.fullName,
        date: repo.createdAt.slice(0, 10),
        stars: 0,
        source: "repository-created-at",
        confidence: "estimated"
      });
    }

    const trendPoints = dataset.repositoryTrends
      .filter((trend) => trend.repoFullName === repo.fullName)
      .map((trend) => ({
        username: dataset.profile.githubUsername,
        repoFullName: repo.fullName,
        date: trend.date,
        stars: trend.stars,
        source: trend.snapshotSource === "stargazer-backfill" ? "stargazer-backfill" as const : "scheduled-snapshot" as const,
        confidence: trend.snapshotSource === "stargazer-backfill" ? "exact" as const : "estimated" as const
      }));

    points.push(...trendPoints);
    if (!points.some((point) => point.date === date && point.stars === repo.stars)) {
      points.push({
        username: dataset.profile.githubUsername,
        repoFullName: repo.fullName,
        date,
        stars: repo.stars,
        source: "scheduled-snapshot",
        confidence: "estimated"
      });
    }

    return dedupeStarHistory(points);
  });
}

export function generateMonthlyGrowthSummary(dataset: GitHubDataset, previousDataset?: GitHubDataset): MonthlyGrowthSummary {
  const month = topMonth(dataset.contributions.monthlyStats);
  const activeRepositories = dataset.repositories.filter((repo) => isVisibleRepo(repo) && isRecentlyUpdated(repo)).length;
  const summary: MonthlyGrowthSummary = {
    month,
    username: dataset.profile.githubUsername,
    contributions: dataset.contributions.monthlyStats[month] ?? dataset.contributions.totalContributions,
    commits: dataset.contributions.commitContributions,
    stars: dataset.totalStars,
    forks: dataset.totalForks,
    pullRequests: dataset.pullRequests.total,
    issues: dataset.issues.total,
    activeRepositories,
    topLanguages: Object.keys(dataset.languages.recentYear).slice(0, 5)
  };

  if (previousDataset) {
    summary.delta = {
      contributions: dataset.contributions.totalContributions - previousDataset.contributions.totalContributions,
      stars: dataset.totalStars - previousDataset.totalStars,
      forks: dataset.totalForks - previousDataset.totalForks,
      repositories: dataset.profile.publicRepos - previousDataset.profile.publicRepos
    };
  }

  return summary;
}

export function generateYearInReview(dataset: GitHubDataset, year = dataset.contributions.year): YearInReview {
  const achievements = calculateAchievements(dataset, undefined, "en-US");
  const unlocked = achievements.filter((item) => item.unlocked);
  const topRepositories = rankRepositories(dataset.repositories)
    .slice(0, 6)
    .map((repo) => ({ fullName: repo.fullName, stars: repo.stars, forks: repo.forks, language: repo.language }));
  const topLanguages = Object.entries(dataset.languages.byBytes)
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));
  const totals = {
    contributions: dataset.contributions.totalContributions,
    commits: dataset.contributions.commitContributions,
    pullRequests: dataset.pullRequests.total,
    issues: dataset.issues.total,
    reviews: dataset.contributions.reviewContributions,
    stars: dataset.totalStars,
    forks: dataset.totalForks,
    repositories: dataset.profile.publicRepos,
    followers: dataset.profile.followers
  };

  const markdown = [
    `# ${year} GitHub Year in Review`,
    "",
    `@${dataset.profile.githubUsername} generated ${localeNumber(totals.contributions, "en-US")} contributions, ${localeNumber(totals.pullRequests, "en-US")} pull requests, and ${localeNumber(totals.issues, "en-US")} issues.`,
    `Public repositories collected ${localeNumber(totals.stars, "en-US")} stars and ${localeNumber(totals.forks, "en-US")} forks.`,
    "",
    "## Top repositories",
    topRepositories.map((repo) => `- ${repo.fullName}: ${repo.stars} stars, ${repo.forks} forks${repo.language ? `, ${repo.language}` : ""}`).join("\n") || "- Repository activity is still growing.",
    "",
    "## Top languages",
    topLanguages.map((item) => `- ${item.name}: ${item.value}`).join("\n") || "- Language data is not available yet.",
    "",
    `## Achievements`,
    `${unlocked.length} achievements unlocked.`
  ].join("\n");

  return {
    year,
    username: dataset.profile.githubUsername,
    totals,
    topRepositories,
    topLanguages,
    unlockedAchievements: unlocked.length,
    markdown
  };
}

export function generateGrowthRecommendations(
  dataset: GitHubDataset,
  config: ProfileStudioConfig = demoProfileConfig(dataset.profile.githubUsername, "en-US"),
  previousDataset?: GitHubDataset
): GrowthRecommendation[] {
  const monthly = generateMonthlyGrowthSummary(dataset, previousDataset);
  const year = generateYearInReview(dataset);
  const strongestRepo = rankRepositories(dataset.repositories)[0];
  const topLanguage = Object.keys(dataset.languages.recentYear)[0] ?? Object.keys(dataset.languages.byRepoCount)[0] ?? config.skills[0]?.name ?? "TypeScript";
  const hasEducation = config.education.some((item) => item.showInReadme || item.showInPages);
  const hasJobPlan = Boolean(config.learningPlan.jobPlan?.trim());
  const starDelta = previousDataset ? dataset.totalStars - previousDataset.totalStars : dataset.totalStars;
  const contributionDelta = previousDataset
    ? dataset.contributions.totalContributions - previousDataset.contributions.totalContributions
    : dataset.contributions.totalContributions;

  return [
    recommendation(
      "new-repository",
      "N-GROW-001",
      { en: "New repository recommendation", zh: "新仓库推荐" },
      {
        en: dataset.profile.publicRepos === 0
          ? "Create a first public repository with a README, topics, and a small demo."
          : `Turn the strongest current theme into a focused repository; ${topLanguage} is the clearest signal right now.`,
        zh: dataset.profile.publicRepos === 0 ? "创建第一个带 README、topics 和演示的公开仓库。" : `把当前最强方向整理成一个聚焦仓库；${topLanguage} 是最清晰的信号。`
      },
      dataset.profile.publicRepos === 0 ? "high" : "medium",
      { publicRepos: dataset.profile.publicRepos, topLanguage },
      ["Create a repo from the recommended template", "Add topics and a concise README", "Publish a small milestone release"]
    ),
    recommendation(
      "commit-growth",
      "N-GROW-002",
      { en: "Commit growth recommendation", zh: "Commit 增长推荐" },
      {
        en: contributionDelta > 0 ? `Contribution volume is up by ${contributionDelta}; keep the current cadence visible.` : "Set a small weekly contribution target and commit learning progress consistently.",
        zh: contributionDelta > 0 ? `贡献量增加了 ${contributionDelta}；继续保持当前节奏。` : "设置小的每周贡献目标，稳定提交学习进展。"
      },
      contributionDelta > 0 ? "low" : "high",
      { contributions: dataset.contributions.totalContributions, contributionDelta },
      ["Add a weekly progress note", "Keep a visible streak target", "Refresh the README contribution card"]
    ),
    recommendation(
      "star-growth",
      "N-GROW-003",
      { en: "Star growth recommendation", zh: "Star 增长推荐" },
      {
        en: strongestRepo ? `Improve ${strongestRepo.fullName} with clearer screenshots, tags, and install steps.` : "Add a project that can earn stars through usefulness and clear documentation.",
        zh: strongestRepo ? `优化 ${strongestRepo.fullName} 的截图、标签和安装步骤。` : "增加一个有实用价值且文档清晰的项目。"
      },
      starDelta > 0 ? "medium" : "high",
      { stars: dataset.totalStars, starDelta, repo: strongestRepo?.fullName ?? "" },
      ["Add project screenshots", "Pin the repo in README and Pages", "Add release notes or a demo link"]
    ),
    recommendation(
      "pr-issue-growth",
      "N-GROW-004",
      { en: "PR and issue growth recommendation", zh: "PR / Issue 增长推荐" },
      {
        en: dataset.pullRequests.total + dataset.issues.total > 0
          ? "Keep PR, issue, and review activity visible in the achievement wall."
          : "Start with documentation issues and small pull requests in beginner-friendly repositories.",
        zh: dataset.pullRequests.total + dataset.issues.total > 0 ? "在成就墙中持续展示 PR、issue 和 review 活动。" : "从适合新人的文档 issue 和小型 PR 开始。"
      },
      dataset.pullRequests.total + dataset.issues.total > 0 ? "medium" : "high",
      { pullRequests: dataset.pullRequests.total, issues: dataset.issues.total, reviews: dataset.contributions.reviewContributions },
      ["Track merged PRs", "Add issue close-rate card", "List target open-source repositories"]
    ),
    recommendation(
      "skill-update",
      "N-GROW-005",
      { en: "Skill update", zh: "技能更新" },
      {
        en: `Promote ${topLanguage} in the skills section and keep secondary technologies grouped by project context.`,
        zh: `在技能区突出 ${topLanguage}，并按项目场景整理辅助技术。`
      },
      "medium",
      { topLanguage, technologyTags: dataset.technologyTags.slice(0, 5).join(", ") },
      ["Update README badges", "Update Pages skill chips", "Align project tech stacks"]
    ),
    recommendation(
      "education-status",
      "N-GROW-006",
      { en: "Education status update", zh: "教育状态更新" },
      {
        en: hasEducation ? "Refresh current courses, honors, and graduation timeline before the next publish." : "Add education or self-study context so new-user output does not look empty.",
        zh: hasEducation ? "下次发布前更新课程、荣誉和毕业时间线。" : "补充教育或自学背景，避免新用户输出显得空白。"
      },
      hasEducation ? "low" : "medium",
      { educationEntries: config.education.length, graduationYear: config.education[0]?.graduationYear ?? "" },
      ["Review course list", "Hide sensitive school fields if needed", "Sync README and Pages visibility"]
    ),
    recommendation(
      "job-status",
      "N-GROW-007",
      { en: "Job status update", zh: "求职状态更新" },
      {
        en: hasJobPlan ? "Keep the career plan tied to visible project case studies." : "Add a job-search or internship status only when it is useful and privacy-safe.",
        zh: hasJobPlan ? "把求职计划与可展示的项目案例保持一致。" : "仅在有帮助且隐私安全时添加求职或实习状态。"
      },
      hasJobPlan ? "low" : "medium",
      { hasJobPlan, currentRole: config.profile.currentRole ?? "" },
      ["Update career summary", "Review privacy switches", "Pin resume-ready project highlights"]
    ),
    recommendation(
      "monthly-summary",
      "N-GROW-008",
      { en: "Monthly growth summary", zh: "月度成长总结" },
      {
        en: `${monthly.month} summary: ${monthly.contributions} contributions, ${monthly.stars} stars, ${monthly.forks} forks, ${monthly.activeRepositories} active repositories.`,
        zh: `${monthly.month} 总结：${monthly.contributions} 次贡献，${monthly.stars} 个 star，${monthly.forks} 个 fork，${monthly.activeRepositories} 个活跃仓库。`
      },
      "medium",
      { month: monthly.month, contributions: monthly.contributions, activeRepositories: monthly.activeRepositories },
      ["Publish monthly summary JSON", "Refresh README growth module", "Update Pages timeline"]
    ),
    recommendation(
      "annual-summary",
      "N-GROW-009",
      { en: "Annual summary", zh: "年度总结" },
      {
        en: `${year.year} review is ready with ${year.totals.contributions} contributions and ${year.unlockedAchievements} unlocked achievements.`,
        zh: `${year.year} 年度总结已生成，包含 ${year.totals.contributions} 次贡献和 ${year.unlockedAchievements} 个已解锁成就。`
      },
      "medium",
      { year: year.year, contributions: year.totals.contributions, achievements: year.unlockedAchievements },
      ["Publish year-in-review markdown", "Archive annual JSON", "Refresh achievement badges"]
    ),
    recommendation(
      "auto-optimization",
      "N-GROW-010",
      { en: "Automatic optimization", zh: "自动优化建议" },
      {
        en: "Prioritize modules with real data, hide noisy empty stats, and keep README, Pages, cards, and achievements in sync.",
        zh: "优先展示有真实数据的模块，隐藏噪声空统计，并同步 README、Pages、卡片和成就。"
      },
      "high",
      { warnings: dataset.profile.publicRepos === 0 || dataset.totalStars === 0, modules: config.enabledReadmeModules.length },
      ["Run compatibility checks", "Apply privacy policy", "Regenerate README, Pages, cards, and achievements together"]
    )
  ];
}

export function createMaintenanceRun(input: MaintenanceRunInput = {}): MaintenanceRun {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const config = input.config ?? demoProfileConfig(input.username ?? input.dataset?.profile.githubUsername ?? "new-developer", "en-US");
  const dataset = input.dataset ?? config.github ?? demoProfileConfig(config.targetUsername, config.locale).github!;
  const workflow = input.workflow ?? defaultWorkflowConfigs()[0];
  const modules = input.modules ?? workflow.modules;
  const snapshots = createRepositorySnapshots(dataset, generatedAt.slice(0, 10));
  const starHistory = createStarHistoryBackfill(dataset, generatedAt.slice(0, 10));
  const recommendations = generateGrowthRecommendations(dataset, config, input.previousDataset);
  const monthlySummary = generateMonthlyGrowthSummary(dataset, input.previousDataset);
  const yearInReview = generateYearInReview(dataset);
  const files: MaintenanceFile[] = [];
  const logs: MaintenanceRun["logs"] = [];

  if (modules.includes("readme")) {
    const readme = generateReadme({ ...config, github: dataset });
    files.push(file("README.md", "markdown", readme.markdown, "Refresh generated README dynamic data.", ["11-001", "11-004"]));
    logs.push({ level: "info", message: "README dynamic modules refreshed.", acceptanceIds: ["11-001"] });
  }

  if (modules.includes("pages-data")) {
    const pages = generatePagesSite({ ...config, github: dataset });
    for (const [path, content] of Object.entries(pages.files).filter(([path]) => path.startsWith("data/"))) {
      files.push(file(path, contentTypeFor(path), content, "Refresh generated GitHub Pages static data.", ["11-002", "11-004"]));
    }
    logs.push({ level: "info", message: "GitHub Pages data refreshed.", acceptanceIds: ["11-002"] });
  }

  if (modules.includes("star-snapshot")) {
    files.push(file("data/star-snapshots.json", "json", stringify(snapshots.filter((item) => item.kind === "star")), "Record repository and account star snapshots.", ["03-017", "11-003"]));
    files.push(file("data/star-history-backfill.json", "json", stringify(starHistory), "Store best-effort star history backfill before scheduled snapshots continue.", ["03-017"]));
  }

  if (modules.includes("fork-snapshot")) {
    files.push(file("data/fork-snapshots.json", "json", stringify(snapshots.filter((item) => item.kind === "fork")), "Record repository and account fork snapshots.", ["11-003"]));
  }

  if (modules.includes("contributions")) {
    files.push(file("data/contributions.json", "json", stringify(dataset.contributions), "Refresh contribution statistics, calendar, streak, and hourly/monthly stats.", ["11-004"]));
  }

  if (modules.includes("blog-rss")) {
    files.push(file("data/blog-posts.json", "json", stringify(buildBlogRefresh(config, generatedAt)), "Refresh configured blog RSS summaries.", ["11-004"]));
  }

  if (modules.includes("achievements")) {
    files.push(file("data/achievements.json", "json", stringify(calculateAchievements(dataset, undefined, config.locale)), "Recalculate achievement progress and README badges.", ["11-004", "07-006"]));
  }

  if (modules.includes("year-in-review")) {
    files.push(file(`data/year-in-review-${yearInReview.year}.json`, "json", stringify(yearInReview), "Store annual GitHub growth summary JSON.", ["11-004", "N-GROW-009"]));
    files.push(file(`YEAR_IN_REVIEW_${yearInReview.year}.md`, "markdown", yearInReview.markdown, "Store annual GitHub growth summary markdown.", ["11-004", "N-GROW-009"]));
  }

  if (modules.includes("card-cache")) {
    files.push(file("data/card-cache-manifest.json", "json", stringify(buildCardCacheManifest(dataset, generatedAt)), "Refresh dynamic card cache metadata.", ["11-004"]));
  }

  if (modules.includes("project-ranking")) {
    files.push(file("data/project-ranking.json", "json", stringify(buildProjectRanking(dataset)), "Update featured project and repository ranking data.", ["11-004"]));
  }

  if (modules.includes("error-notification")) {
    files.push(file("data/automation-errors.json", "json", stringify(buildErrorDigest(generatedAt)), "Aggregate automation failures for user-facing logs.", ["11-004"]));
  }

  files.push(file("data/monthly-growth-summary.json", "json", stringify(monthlySummary), "Store monthly growth summary.", ["N-GROW-008"]));
  files.push(file("data/growth-recommendations.json", "json", stringify(recommendations), "Store automatic growth recommendations.", recommendations.map((item) => item.acceptanceId)));
  files.push(file(".github/workflows/profile-studio-update.yml", "yaml", generateWorkflow(workflow), "Generate configurable daily, weekly, and manual update workflow.", ["11-005", "11-007"]));

  const acceptanceIds = unique(files.flatMap((item) => item.acceptanceIds));
  return {
    username: dataset.profile.githubUsername,
    generatedAt,
    modules,
    summary: {
      files: files.length,
      starSnapshots: snapshots.filter((item) => item.kind === "star").length,
      forkSnapshots: snapshots.filter((item) => item.kind === "fork").length,
      recommendations: recommendations.length,
      workflows: 1,
      acceptanceIds
    },
    files,
    snapshots,
    starHistory,
    monthlySummary,
    yearInReview,
    recommendations,
    logs
  };
}

function recommendation(
  id: GrowthRecommendationKind,
  acceptanceId: string,
  title: LocalizedText,
  message: LocalizedText,
  priority: GrowthRecommendation["priority"],
  evidence: GrowthRecommendation["evidence"],
  actions: string[]
): GrowthRecommendation {
  return { id, acceptanceId, title, message, priority, evidence, actions };
}

function file(path: string, contentType: MaintenanceFile["contentType"], content: string, reason: string, acceptanceIds: string[]): MaintenanceFile {
  return { path, contentType, content, reason, acceptanceIds };
}

function buildFallbackTrends(dataset: GitHubDataset, date: string): RepositoryTrend[] {
  return dataset.repositories.filter(isVisibleRepo).map((repo) => ({
    repoFullName: repo.fullName,
    date,
    stars: repo.stars,
    forks: repo.forks,
    issues: repo.openIssues,
    watchers: repo.watchers,
    subscribers: repo.subscribers,
    contributors: repo.contributors ?? 0,
    releaseDownloads: repo.releaseDownloads ?? 0,
    snapshotSource: "scheduled-snapshot"
  }));
}

function buildBlogRefresh(config: ProfileStudioConfig, generatedAt: string) {
  const source = config.profile.blog ?? config.socialLinks.find((link) => /blog|rss/i.test(link.provider))?.url ?? null;
  return {
    generatedAt,
    source,
    posts: source
      ? [{ title: "Latest blog feed placeholder", url: source, publishedAt: generatedAt, source }]
      : [],
    emptyState: source ? undefined : "No RSS source configured; keep the blog module ready without publishing fake posts."
  };
}

function buildCardCacheManifest(dataset: GitHubDataset, generatedAt: string) {
  const cardTypes = ["stats", "streak", "languages", "star-growth", "pr-issue", "achievements", "contribution-calendar"];
  return {
    generatedAt,
    username: dataset.profile.githubUsername,
    cards: cardTypes.map((type) => ({
      type,
      cacheKey: `${dataset.profile.githubUsername}:${type}:${dataset.contributions.year}`,
      localeVariants: ["en-US", "zh-CN", "bilingual"],
      expiresAt: new Date(Date.parse(generatedAt) + 6 * 60 * 60 * 1000).toISOString()
    }))
  };
}

function buildProjectRanking(dataset: GitHubDataset) {
  const repos = rankRepositories(dataset.repositories);
  return {
    username: dataset.profile.githubUsername,
    featured: repos.slice(0, 6),
    topStarred: [...dataset.repositories].filter(isVisibleRepo).sort((a, b) => b.stars - a.stars).slice(0, 10),
    topForked: [...dataset.repositories].filter(isVisibleRepo).sort((a, b) => b.forks - a.forks).slice(0, 10),
    recentlyUpdated: [...dataset.repositories].filter(isVisibleRepo).sort((a, b) => dateValue(b.pushedAt ?? b.updatedAt) - dateValue(a.pushedAt ?? a.updatedAt)).slice(0, 10)
  };
}

function buildErrorDigest(generatedAt: string) {
  return {
    generatedAt,
    status: "ok",
    errors: [],
    notificationChannels: ["dashboard", "deployment-log"],
    retryPolicy: { maxAttempts: 3, backoffSeconds: [60, 300, 900] }
  };
}

function rankRepositories(repositories: Repository[]): Repository[] {
  return [...repositories]
    .filter(isVisibleRepo)
    .sort((a, b) => scoreRepo(b) - scoreRepo(a) || a.fullName.localeCompare(b.fullName));
}

function scoreRepo(repo: Repository): number {
  return repo.stars * 3 + repo.forks * 2 + repo.watchers + repo.topics.length + (repo.hasPages ? 8 : 0) + (isRecentlyUpdated(repo) ? 5 : 0);
}

function topMonth(stats: Record<string, number>): string {
  const entries = monthKeys.map((key) => [key, stats[key] ?? 0] as const);
  return entries.sort((a, b) => b[1] - a[1] || monthKeys.indexOf(a[0]) - monthKeys.indexOf(b[0]))[0]?.[0] ?? monthKeys[new Date().getUTCMonth()];
}

function contentTypeFor(path: string): MaintenanceFile["contentType"] {
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".html")) return "html";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".js")) return "javascript";
  if (path.endsWith(".md")) return "markdown";
  return "text";
}

function stringify(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function dedupeStarHistory(points: StarHistoryPoint[]): StarHistoryPoint[] {
  const byKey = new Map<string, StarHistoryPoint>();
  for (const point of points) {
    const key = `${point.repoFullName}:${point.date}`;
    const existing = byKey.get(key);
    if (!existing || existing.confidence === "estimated" && point.confidence === "exact") byKey.set(key, point);
  }
  return [...byKey.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function isVisibleRepo(repo: Repository): boolean {
  return !repo.isPrivate && !repo.isArchived;
}

function isRecentlyUpdated(repo: Repository): boolean {
  const value = dateValue(repo.pushedAt ?? repo.updatedAt);
  return value > 0 && Date.now() - value < 120 * 24 * 60 * 60 * 1000;
}

function dateValue(value?: string): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function localizeRecommendation(recommendation: GrowthRecommendation, locale: ProfileStudioConfig["locale"]): {
  id: GrowthRecommendationKind;
  title: string;
  message: string;
  priority: GrowthRecommendation["priority"];
  actions: string[];
  acceptanceId: string;
} {
  return {
    id: recommendation.id,
    title: localize(recommendation.title, locale),
    message: localize(recommendation.message, locale),
    priority: recommendation.priority,
    actions: recommendation.actions,
    acceptanceId: recommendation.acceptanceId
  };
}
