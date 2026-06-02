import type { GitHubDataset, Repository, RepositoryTrend } from "@gps/core";
import { calculateGrowthSummary, calculateRepositoryRankings } from "./stats";

export type RepositoryFieldCoverage = {
  totalRepositories: number;
  expectedPublicRepositories: number;
  listComplete: boolean;
  requiredFields: Record<string, boolean>;
  watcherSemantics: {
    starsUseStargazersCount: boolean;
    githubWatchersCountPreserved: boolean;
    trueWatchersUseSubscribersCount: boolean;
    note: string;
  };
};

export type MetricCurvePoint = {
  date: string;
  value: number;
};

export type RepositoryMetricCurve = {
  repoFullName: string;
  points: MetricCurvePoint[];
};

export type TechnologyCategory =
  | "frontend"
  | "backend"
  | "database"
  | "devops"
  | "testing"
  | "cloud"
  | "language"
  | "ai-data"
  | "mobile"
  | "other";

export type TechnologyDetection = {
  tags: string[];
  topics: string[];
  readmeSignals: string[];
  packageSignals: string[];
  categories: Record<TechnologyCategory, string[]>;
};

export type GitHubProfileAnalytics = {
  repositoryFields: RepositoryFieldCoverage;
  releaseStats: {
    repositoriesWithReleases: number;
    latestReleaseAt?: string;
    totalReleaseDownloads: number;
  };
  contributionStats: {
    total: number;
    commits: number;
    issues: number;
    pullRequests: number;
    reviews: number;
    currentStreak: number;
    longestStreak: number;
    monthly: Record<string, number>;
    weekly: Record<string, number>;
    hourly: Record<string, number>;
  };
  starStats: {
    total: number;
    ranking: Array<{ repoFullName: string; stars: number; forks: number; watchers: number }>;
    growth: Record<"7d" | "30d" | "90d" | "365d", number>;
    repositoryCurves: RepositoryMetricCurve[];
    userCurve: MetricCurvePoint[];
    fastestGrowing: Array<{ repoFullName: string; stars: number; forks: number; score: number }>;
  };
  forkStats: {
    total: number;
    ranking: Array<{ repoFullName: string; forks: number; stars: number; contributors: number }>;
    growth: Record<"7d" | "30d" | "90d" | "365d", number>;
    repositoryCurves: RepositoryMetricCurve[];
    userCurve: MetricCurvePoint[];
  };
  communityImpact: {
    score: number;
    factors: Record<string, number>;
  };
  pullRequests: GitHubDataset["pullRequests"];
  issues: GitHubDataset["issues"];
  technology: TechnologyDetection;
};

const technologyCatalog: Record<TechnologyCategory, string[]> = {
  frontend: ["react", "nextjs", "next.js", "vue", "svelte", "angular", "tailwind", "css", "html", "vite"],
  backend: ["node", "nodejs", "express", "nestjs", "fastapi", "django", "spring", "api", "server"],
  database: ["postgres", "postgresql", "mysql", "mongodb", "sqlite", "redis", "prisma", "database"],
  devops: ["docker", "kubernetes", "terraform", "github actions", "ci", "cd", "devops", "workflow"],
  testing: ["vitest", "jest", "playwright", "testing", "test", "cypress"],
  cloud: ["aws", "azure", "gcp", "vercel", "netlify", "cloudflare", "serverless"],
  language: ["typescript", "javascript", "python", "go", "rust", "java", "c#", "php", "ruby", "swift", "kotlin"],
  "ai-data": ["ai", "ml", "machine learning", "data", "pandas", "tensorflow", "pytorch", "llm"],
  mobile: ["android", "ios", "react native", "flutter", "swift", "kotlin"],
  other: []
};

export function analyzeGitHubDataset(dataset: GitHubDataset): GitHubProfileAnalytics {
  const growth = calculateGrowthSummary(dataset.repositories, dataset.repositoryTrends);
  const rankings = calculateRepositoryRankings(dataset.repositories, dataset.repositoryTrends);
  const releaseStats = calculateReleaseStats(dataset.repositories);
  const technology = detectTechnologyStack(dataset.repositories, dataset.technologyTags);
  const communityImpact = calculateCommunityImpact(dataset);

  return {
    repositoryFields: calculateRepositoryFieldCoverage(dataset),
    releaseStats,
    contributionStats: {
      total: dataset.contributions.totalContributions,
      commits: dataset.contributions.commitContributions,
      issues: dataset.contributions.issueContributions,
      pullRequests: dataset.contributions.pullRequestContributions,
      reviews: dataset.contributions.reviewContributions,
      currentStreak: dataset.contributions.currentStreak,
      longestStreak: dataset.contributions.longestStreak,
      monthly: dataset.contributions.monthlyStats,
      weekly: dataset.contributions.weeklyStats,
      hourly: dataset.contributions.hourlyStats
    },
    starStats: {
      total: dataset.totalStars,
      ranking: growth.starsByRepo,
      growth: growth.starGrowth,
      repositoryCurves: buildRepositoryCurves(dataset.repositoryTrends, "stars"),
      userCurve: buildUserCurve(dataset.repositoryTrends, "stars"),
      fastestGrowing: rankings.fastestGrowing.map((trend) => ({
        repoFullName: trend.repoFullName,
        stars: trend.stars,
        forks: trend.forks,
        score: trend.stars * 3 + trend.forks * 2 + trend.contributors
      }))
    },
    forkStats: {
      total: dataset.totalForks,
      ranking: growth.forksByRepo,
      growth: growth.forkGrowth,
      repositoryCurves: buildRepositoryCurves(dataset.repositoryTrends, "forks"),
      userCurve: buildUserCurve(dataset.repositoryTrends, "forks")
    },
    communityImpact,
    pullRequests: dataset.pullRequests,
    issues: dataset.issues,
    technology
  };
}

export function calculateRepositoryFieldCoverage(dataset: GitHubDataset): RepositoryFieldCoverage {
  const visible = dataset.repositories.filter((repo) => !repo.isPrivate);
  return {
    totalRepositories: dataset.repositories.length,
    expectedPublicRepositories: dataset.profile.publicRepos,
    listComplete: dataset.repositories.length >= dataset.profile.publicRepos || dataset.profile.publicRepos === 0,
    requiredFields: {
      identity: visible.every((repo) => Boolean(repo.githubRepoId && repo.owner && repo.name && repo.fullName)),
      descriptionHomepageLanguageTopics: visible.every((repo) => "description" in repo && "homepage" in repo && "language" in repo && Array.isArray(repo.topics)),
      createdUpdatedPushedSizeDefaultBranch: visible.every((repo) => Boolean(repo.createdAt && repo.updatedAt && repo.pushedAt && repo.defaultBranch) && Number.isFinite(repo.size)),
      starsForksWatchersSubscribers: visible.every((repo) => Number.isFinite(repo.stars) && Number.isFinite(repo.forks) && Number.isFinite(repo.watchers) && Number.isFinite(repo.subscribers)),
      archivedForkTemplateVisibility: visible.every((repo) => typeof repo.isArchived === "boolean" && typeof repo.isFork === "boolean" && typeof repo.isPrivate === "boolean" && Boolean(repo.visibility)),
      releases: visible.every((repo) => repo.releaseCount === undefined || Number.isFinite(repo.releaseCount)),
      contributorsLanguagesReadme: visible.every((repo) => repo.contributors === undefined || Number.isFinite(repo.contributors))
    },
    watcherSemantics: {
      starsUseStargazersCount: true,
      githubWatchersCountPreserved: visible.every((repo) => Number.isFinite(repo.watchers)),
      trueWatchersUseSubscribersCount: visible.every((repo) => Number.isFinite(repo.subscribers)),
      note: "GitHub REST watchers_count is preserved separately from subscribers_count; Profile Studio uses stargazers_count for stars and subscribers_count for true watcher/subscriber counts."
    }
  };
}

export function detectTechnologyStack(repositories: Repository[], datasetTags: string[] = []): TechnologyDetection {
  const topics = unique(repositories.flatMap((repo) => repo.topics));
  const readmeSignals = unique(repositories.flatMap((repo) => tokenize(repo.readmeSummary ?? "")));
  const packageSignals = unique(repositories.flatMap((repo) => tokenize([repo.language, ...Object.keys(repo.languages ?? {})].filter(Boolean).join(" "))));
  const tags = unique([...datasetTags, ...topics, ...readmeSignals, ...packageSignals].filter(Boolean));
  const categories: Record<TechnologyCategory, string[]> = {
    frontend: [],
    backend: [],
    database: [],
    devops: [],
    testing: [],
    cloud: [],
    language: [],
    "ai-data": [],
    mobile: [],
    other: []
  };

  for (const tag of tags) {
    const normalized = normalizeTerm(tag);
    let matched = false;
    for (const [category, needles] of Object.entries(technologyCatalog) as Array<[TechnologyCategory, string[]]>) {
      if (needles.some((needle) => normalized.includes(needle))) {
        categories[category].push(tag);
        matched = true;
      }
    }
    if (!matched) categories.other.push(tag);
  }

  for (const category of Object.keys(categories) as TechnologyCategory[]) {
    categories[category] = unique(categories[category]).slice(0, 12);
  }

  return { tags, topics, readmeSignals, packageSignals, categories };
}

function calculateReleaseStats(repositories: Repository[]): GitHubProfileAnalytics["releaseStats"] {
  const releaseDates = repositories.map((repo) => repo.latestReleaseAt).filter((value): value is string => Boolean(value));
  return {
    repositoriesWithReleases: repositories.filter((repo) => (repo.releaseCount ?? 0) > 0).length,
    latestReleaseAt: releaseDates.sort((a, b) => b.localeCompare(a))[0],
    totalReleaseDownloads: repositories.reduce((total, repo) => total + (repo.releaseDownloads ?? 0), 0)
  };
}

function calculateCommunityImpact(dataset: GitHubDataset): GitHubProfileAnalytics["communityImpact"] {
  const factors = {
    stars: dataset.totalStars * 2,
    forks: dataset.totalForks * 3,
    followers: dataset.profile.followers,
    pullRequests: dataset.pullRequests.merged * 2 + dataset.pullRequests.reviewed,
    issues: dataset.issues.closed,
    contributors: dataset.repositories.reduce((total, repo) => total + (repo.contributors ?? 0), 0),
    releases: dataset.repositories.reduce((total, repo) => total + (repo.releaseCount ?? 0), 0) * 2
  };
  return { factors, score: Object.values(factors).reduce((total, value) => total + value, 0) };
}

function buildRepositoryCurves(trends: RepositoryTrend[], key: "stars" | "forks"): RepositoryMetricCurve[] {
  const grouped = new Map<string, MetricCurvePoint[]>();
  for (const trend of trends) {
    const points = grouped.get(trend.repoFullName) ?? [];
    points.push({ date: trend.date, value: trend[key] });
    grouped.set(trend.repoFullName, points);
  }
  return [...grouped.entries()].map(([repoFullName, points]) => ({
    repoFullName,
    points: points.sort((a, b) => a.date.localeCompare(b.date))
  }));
}

function buildUserCurve(trends: RepositoryTrend[], key: "stars" | "forks"): MetricCurvePoint[] {
  const byDate = new Map<string, number>();
  for (const trend of trends) {
    byDate.set(trend.date, (byDate.get(trend.date) ?? 0) + trend[key]);
  }
  return [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([date, value]) => ({ date, value }));
}

function tokenize(value: string): string[] {
  return value
    .split(/[^a-zA-Z0-9+#.]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2);
}

function normalizeTerm(value: string): string {
  return value.toLowerCase().replaceAll("-", " ").replaceAll("_", " ");
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
