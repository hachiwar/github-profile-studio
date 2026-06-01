import type {
  ContributionDay,
  ContributionStats,
  GitHubDataset,
  IssueStats,
  LanguageStats,
  PullRequestStats,
  Repository,
  RepositoryTrend,
  UserProfile
} from "@gps/core";

export type RepositoryRankings = {
  topStarred: Repository[];
  topForked: Repository[];
  recentlyUpdated: Repository[];
  recentlyCreated: Repository[];
  fastestGrowing: RepositoryTrend[];
  mostDiscussed: Repository[];
  featured: Repository[];
};

export type GrowthSummary = {
  totalStars: number;
  totalForks: number;
  starsByRepo: Array<{ repoFullName: string; stars: number; forks: number; watchers: number }>;
  forksByRepo: Array<{ repoFullName: string; forks: number; stars: number; contributors: number }>;
  starGrowth: Record<"7d" | "30d" | "90d" | "365d", number>;
  forkGrowth: Record<"7d" | "30d" | "90d" | "365d", number>;
};

const MONTH_KEYS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEK_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function calculateLanguageStats(repositories: Repository[], repoLanguageBytes: Record<string, Record<string, number>> = {}): LanguageStats {
  const byRepoCount: Record<string, number> = {};
  const byBytes: Record<string, number> = {};
  const recentYear: Record<string, number> = {};
  const starWeighted: Record<string, number> = {};
  const forkWeighted: Record<string, number> = {};
  const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;

  for (const repo of repositories.filter((item) => !item.isPrivate && !item.isArchived)) {
    const language = repo.language ?? "Other";
    byRepoCount[language] = (byRepoCount[language] ?? 0) + 1;
    starWeighted[language] = (starWeighted[language] ?? 0) + repo.stars;
    forkWeighted[language] = (forkWeighted[language] ?? 0) + repo.forks;

    if (repo.pushedAt && Date.parse(repo.pushedAt) >= oneYearAgo) {
      recentYear[language] = (recentYear[language] ?? 0) + Math.max(repo.size, 1);
    }

    const byteMap = repo.languages ?? repoLanguageBytes[repo.fullName] ?? {};
    if (Object.keys(byteMap).length === 0) {
      byBytes[language] = (byBytes[language] ?? 0) + Math.max(repo.size, 1);
    } else {
      for (const [byteLanguage, bytes] of Object.entries(byteMap)) {
        byBytes[byteLanguage] = (byBytes[byteLanguage] ?? 0) + safeNumber(bytes);
      }
    }
  }

  return {
    byRepoCount: sortRecord(byRepoCount),
    byBytes: sortRecord(byBytes),
    recentYear: sortRecord(recentYear),
    starWeighted: sortRecord(starWeighted),
    forkWeighted: sortRecord(forkWeighted)
  };
}

export function buildCurrentRepositoryTrends(repositories: Repository[], date = new Date().toISOString().slice(0, 10)): RepositoryTrend[] {
  return repositories
    .filter((repo) => !repo.isPrivate)
    .map((repo) => ({
      repoFullName: repo.fullName,
      date,
      stars: repo.stars,
      forks: repo.forks,
      issues: repo.openIssues,
      watchers: repo.watchers,
      subscribers: repo.subscribers,
      contributors: repo.contributors ?? 0,
      releaseDownloads: repo.releaseDownloads ?? 0,
      snapshotSource: "github-api" as const
    }));
}

export function calculateRepositoryRankings(repositories: Repository[], trends: RepositoryTrend[] = []): RepositoryRankings {
  const visible = repositories.filter((repo) => !repo.isPrivate && !repo.isArchived);
  const newestTrendByRepo = new Map<string, RepositoryTrend>();
  for (const trend of trends) newestTrendByRepo.set(trend.repoFullName, trend);

  return {
    topStarred: sortRepos(visible, (repo) => repo.stars).slice(0, 10),
    topForked: sortRepos(visible, (repo) => repo.forks).slice(0, 10),
    recentlyUpdated: [...visible].sort((a, b) => dateValue(b.pushedAt ?? b.updatedAt) - dateValue(a.pushedAt ?? a.updatedAt)).slice(0, 10),
    recentlyCreated: [...visible].sort((a, b) => dateValue(b.createdAt) - dateValue(a.createdAt)).slice(0, 10),
    fastestGrowing: [...newestTrendByRepo.values()]
      .sort((a, b) => b.stars + b.forks - (a.stars + a.forks))
      .slice(0, 10),
    mostDiscussed: sortRepos(visible, (repo) => repo.openIssues + (repo.hasDiscussions ? 5 : 0)).slice(0, 10),
    featured: sortRepos(visible, (repo) => repo.stars * 3 + repo.forks * 2 + (repo.hasPages ? 10 : 0) + repo.topics.length).slice(0, 6)
  };
}

export function calculateGrowthSummary(repositories: Repository[], trends: RepositoryTrend[] = []): GrowthSummary {
  const totalStars = repositories.reduce((total, repo) => total + repo.stars, 0);
  const totalForks = repositories.reduce((total, repo) => total + repo.forks, 0);
  const snapshotGrowth = calculateSnapshotGrowth(trends);

  return {
    totalStars,
    totalForks,
    starsByRepo: sortRepos(repositories, (repo) => repo.stars)
      .slice(0, 20)
      .map((repo) => ({ repoFullName: repo.fullName, stars: repo.stars, forks: repo.forks, watchers: repo.watchers })),
    forksByRepo: sortRepos(repositories, (repo) => repo.forks)
      .slice(0, 20)
      .map((repo) => ({ repoFullName: repo.fullName, forks: repo.forks, stars: repo.stars, contributors: repo.contributors ?? 0 })),
    starGrowth: snapshotGrowth.stars,
    forkGrowth: snapshotGrowth.forks
  };
}

export function estimateContributionStats(username: string, repositories: Repository[], profile: UserProfile, year = new Date().getFullYear()): ContributionStats {
  const days = buildContributionDays(repositories, year);
  const totalContributions = days.reduce((total, day) => total + day.count, 0);
  const streaks = calculateStreaks(days);
  const monthStats: Record<string, number> = Object.fromEntries(MONTH_KEYS.map((key) => [key, 0]));
  const weekStats: Record<string, number> = Object.fromEntries(WEEK_KEYS.map((key) => [key, 0]));
  const hourStats: Record<string, number> = {};

  for (const day of days) {
    const date = new Date(`${day.date}T00:00:00.000Z`);
    monthStats[MONTH_KEYS[date.getUTCMonth()]] += day.count;
    weekStats[WEEK_KEYS[date.getUTCDay()]] += day.count;
  }

  for (const repo of repositories) {
    const hour = repo.pushedAt ? String(new Date(repo.pushedAt).getUTCHours()).padStart(2, "0") : "12";
    hourStats[hour] = (hourStats[hour] ?? 0) + Math.max(1, Math.round(repo.stars / 10) + 1);
  }

  const issueContributions = Math.max(0, repositories.reduce((total, repo) => total + repo.openIssues, 0));
  const pullRequestContributions = Math.max(0, Math.round(repositories.filter((repo) => repo.isFork).length + repositories.length * 0.8));
  const reviewContributions = Math.max(0, Math.round(pullRequestContributions * 0.35));
  const commitContributions = Math.max(0, totalContributions - issueContributions - pullRequestContributions - reviewContributions);

  return {
    username,
    year,
    totalContributions,
    commitContributions,
    issueContributions,
    pullRequestContributions,
    reviewContributions,
    currentStreak: streaks.currentStreak,
    longestStreak: streaks.longestStreak,
    contributionDays: days,
    monthlyStats: monthStats,
    weeklyStats: weekStats,
    hourlyStats: sortRecord(hourStats),
    restrictedContributions: profile.publicRepos === 0 ? 0 : undefined
  };
}

export function estimatePullRequestStats(contributions: ContributionStats, repositories: Repository[]): PullRequestStats {
  const total = contributions.pullRequestContributions;
  const merged = Math.round(total * 0.72);
  const closed = Math.max(0, total - merged);
  const organizations = new Set(repositories.map((repo) => repo.owner).filter(Boolean)).size;

  return {
    total,
    merged,
    closed,
    reviewed: contributions.reviewContributions,
    recentYear: total,
    mergeRate: percentage(merged, total),
    externalRepositories: repositories.filter((repo) => repo.isFork || repo.owner !== contributions.username).length,
    organizations
  };
}

export function estimateIssueStats(contributions: ContributionStats, repositories: Repository[]): IssueStats {
  const total = Math.max(contributions.issueContributions, repositories.reduce((sum, repo) => sum + repo.openIssues, 0));
  const closed = Math.max(0, Math.round(total * 0.74));

  return {
    total,
    closed,
    recentYear: contributions.issueContributions,
    closeRate: percentage(closed, total),
    participantCount: Math.max(0, repositories.reduce((sum, repo) => sum + (repo.contributors ?? 0), 0))
  };
}

export function extractTechnologyTags(repositories: Repository[], languageStats: LanguageStats): string[] {
  const tags = new Set<string>();
  for (const language of Object.keys(languageStats.byRepoCount).slice(0, 8)) tags.add(language);
  for (const repo of repositories) {
    for (const topic of repo.topics) tags.add(formatTopic(topic));
  }
  return [...tags].filter(Boolean).slice(0, 24);
}

export function buildDatasetFromPublicData(input: {
  profile: UserProfile;
  repositories: Repository[];
  contributions?: ContributionStats;
  pullRequests?: PullRequestStats;
  issues?: IssueStats;
  languages?: LanguageStats;
  year?: number;
}): GitHubDataset {
  const year = input.year ?? new Date().getFullYear();
  const languages = input.languages ?? calculateLanguageStats(input.repositories);
  const contributions = input.contributions ?? estimateContributionStats(input.profile.githubUsername, input.repositories, input.profile, year);
  const repositoryTrends = buildCurrentRepositoryTrends(input.repositories);
  const totalStars = input.repositories.reduce((total, repo) => total + repo.stars, 0);
  const totalForks = input.repositories.reduce((total, repo) => total + repo.forks, 0);

  return {
    profile: input.profile,
    repositories: input.repositories,
    contributions,
    repositoryTrends,
    pullRequests: input.pullRequests ?? estimatePullRequestStats(contributions, input.repositories),
    issues: input.issues ?? estimateIssueStats(contributions, input.repositories),
    languages,
    totalStars,
    totalForks,
    technologyTags: extractTechnologyTags(input.repositories, languages),
    fetchedAt: new Date().toISOString()
  };
}

function calculateSnapshotGrowth(trends: RepositoryTrend[]): {
  stars: Record<"7d" | "30d" | "90d" | "365d", number>;
  forks: Record<"7d" | "30d" | "90d" | "365d", number>;
} {
  const windows = { "7d": 7, "30d": 30, "90d": 90, "365d": 365 } as const;
  const result = {
    stars: { "7d": 0, "30d": 0, "90d": 0, "365d": 0 },
    forks: { "7d": 0, "30d": 0, "90d": 0, "365d": 0 }
  };
  const byRepo = groupByRepo(trends);
  const now = Date.now();

  for (const [windowKey, days] of Object.entries(windows) as Array<[keyof typeof windows, number]>) {
    const minDate = now - days * 24 * 60 * 60 * 1000;
    for (const repoTrends of byRepo.values()) {
      const sorted = [...repoTrends].sort((a, b) => dateValue(a.date) - dateValue(b.date));
      const latest = sorted.at(-1);
      const baseline = sorted.find((trend) => dateValue(trend.date) >= minDate) ?? sorted[0];
      if (!latest || !baseline) continue;
      result.stars[windowKey] += Math.max(0, latest.stars - baseline.stars);
      result.forks[windowKey] += Math.max(0, latest.forks - baseline.forks);
    }
  }

  return result;
}

function buildContributionDays(repositories: Repository[], year: number): ContributionDay[] {
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year, 11, 31);
  const byDate = new Map<string, number>();

  for (const repo of repositories) {
    const relevantDates = [repo.createdAt, repo.updatedAt, repo.pushedAt].filter(Boolean) as string[];
    for (const value of relevantDates) {
      const timestamp = Date.parse(value);
      if (!Number.isFinite(timestamp)) continue;
      const date = new Date(timestamp);
      if (date.getUTCFullYear() !== year) continue;
      const key = date.toISOString().slice(0, 10);
      const weight = Math.max(1, Math.round((repo.stars + repo.forks + repo.topics.length) / 8) + 1);
      byDate.set(key, (byDate.get(key) ?? 0) + weight);
    }
  }

  const days: ContributionDay[] = [];
  for (let cursor = start; cursor <= end; cursor += 24 * 60 * 60 * 1000) {
    const date = new Date(cursor).toISOString().slice(0, 10);
    const count = byDate.get(date) ?? 0;
    days.push({ date, count, level: contributionLevel(count) });
  }
  return days;
}

export function calculateStreaks(days: ContributionDay[]): { currentStreak: number; longestStreak: number } {
  let longestStreak = 0;
  let activeStreak = 0;
  for (const day of days) {
    if (day.count > 0) {
      activeStreak += 1;
      longestStreak = Math.max(longestStreak, activeStreak);
    } else {
      activeStreak = 0;
    }
  }

  let currentStreak = 0;
  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (days[index].count > 0) currentStreak += 1;
    else if (currentStreak > 0) break;
  }

  return { currentStreak, longestStreak };
}

export function contributionLevel(count: number): ContributionDay["level"] {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

function groupByRepo(trends: RepositoryTrend[]): Map<string, RepositoryTrend[]> {
  const grouped = new Map<string, RepositoryTrend[]>();
  for (const trend of trends) {
    const list = grouped.get(trend.repoFullName) ?? [];
    list.push(trend);
    grouped.set(trend.repoFullName, list);
  }
  return grouped;
}

function sortRepos(repositories: Repository[], score: (repo: Repository) => number): Repository[] {
  return [...repositories].sort((a, b) => score(b) - score(a) || a.fullName.localeCompare(b.fullName));
}

function sortRecord(record: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.entries(record).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
}

function safeNumber(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function dateValue(value?: string): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function percentage(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function formatTopic(topic: string): string {
  const normalized = topic.replaceAll("-", " ").replaceAll("_", " ").trim();
  return normalized.length > 0 ? normalized.replace(/\b\w/g, (letter) => letter.toUpperCase()) : "";
}
