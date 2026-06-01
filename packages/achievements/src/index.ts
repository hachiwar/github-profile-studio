import type { AchievementResult, AchievementRule, GitHubDataset, Repository, StudioLocale } from "@gps/core";
import { localize } from "@gps/core";

type RuleInput = {
  key: string;
  category: string;
  en: string;
  zh: string;
  descriptionEn: string;
  level: AchievementRule["level"];
  rarity: AchievementRule["rarity"];
  score: number;
  target: number;
  acceptanceId: string;
  evaluate: AchievementRule["evaluate"];
};

export const defaultAchievementRules: AchievementRule[] = [
  // Contribution achievements.
  rule({ key: "first-commit", category: "contribution", en: "First Commit", zh: "First Commit", descriptionEn: "Made the first public contribution.", level: "bronze", rarity: "common", score: 10, target: 1, acceptanceId: "07-002", evaluate: (data) => data.contributions.commitContributions }),
  rule({ key: "daily-coder", category: "contribution", en: "Daily Coder", zh: "Daily Coder", descriptionEn: "Built a daily contribution rhythm.", level: "bronze", rarity: "common", score: 15, target: 7, acceptanceId: "07-002", evaluate: (data) => data.contributions.currentStreak }),
  rule({ key: "weekly-builder", category: "contribution", en: "Weekly Builder", zh: "Weekly Builder", descriptionEn: "Built momentum with weekly contributions.", level: "silver", rarity: "uncommon", score: 25, target: 25, acceptanceId: "07-002", evaluate: (data) => data.contributions.totalContributions }),
  rule({ key: "monthly-grinder", category: "contribution", en: "Monthly Grinder", zh: "Monthly Grinder", descriptionEn: "Sustained a productive contribution month.", level: "silver", rarity: "uncommon", score: 30, target: 50, acceptanceId: "07-002", evaluate: (data) => maxRecord(data.contributions.monthlyStats) }),
  rule({ key: "streak-master", category: "continuous-activity", en: "Streak Master", zh: "Streak Master", descriptionEn: "Maintained a strong contribution streak.", level: "gold", rarity: "rare", score: 50, target: 30, acceptanceId: "07-002", evaluate: (data) => data.contributions.longestStreak }),
  rule({ key: "long-runner", category: "continuous-activity", en: "Long Runner", zh: "Long Runner", descriptionEn: "Kept showing up across a long contribution window.", level: "gold", rarity: "rare", score: 60, target: 90, acceptanceId: "07-002", evaluate: (data) => data.contributions.totalContributions }),
  rule({ key: "contribution-legend", category: "contribution", en: "Contribution Legend", zh: "Contribution Legend", descriptionEn: "Reached a high annual contribution total.", level: "legendary", rarity: "legendary", score: 150, target: 1000, acceptanceId: "07-002", evaluate: (data) => data.contributions.totalContributions }),
  rule({ key: "commit-machine", category: "contribution", en: "Commit Machine", zh: "Commit Machine", descriptionEn: "Created a large number of commit contributions.", level: "gold", rarity: "rare", score: 75, target: 500, acceptanceId: "07-002", evaluate: (data) => data.contributions.commitContributions }),
  rule({ key: "open-source-veteran", category: "time-tenure", en: "Open Source Veteran", zh: "Open Source Veteran", descriptionEn: "Has maintained a GitHub account for multiple years.", level: "gold", rarity: "rare", score: 70, target: 3, acceptanceId: "07-002", evaluate: (data) => accountAgeYears(data.profile.createdAt) }),
  rule({ key: "consistency-king", category: "continuous-activity", en: "Consistency King", zh: "Consistency King", descriptionEn: "Shows consistent contribution distribution.", level: "platinum", rarity: "epic", score: 120, target: 5, acceptanceId: "07-002", evaluate: (data) => Object.values(data.contributions.weeklyStats).filter((value) => value > 0).length }),

  // Star achievements.
  rule({ key: "first-star", category: "star", en: "First Star", zh: "First Star", descriptionEn: "Earned the first repository star.", level: "bronze", rarity: "common", score: 10, target: 1, acceptanceId: "07-003", evaluate: (data) => data.totalStars }),
  rule({ key: "star-collector", category: "star", en: "Star Collector", zh: "Star Collector", descriptionEn: "Collected community interest across repositories.", level: "silver", rarity: "uncommon", score: 30, target: 25, acceptanceId: "07-003", evaluate: (data) => data.totalStars }),
  rule({ key: "star-magnet", category: "star", en: "Star Magnet", zh: "Star Magnet", descriptionEn: "Attracted strong attention to public repositories.", level: "gold", rarity: "rare", score: 60, target: 100, acceptanceId: "07-003", evaluate: (data) => data.totalStars }),
  rule({ key: "star-legend", category: "star", en: "Star Legend", zh: "Star Legend", descriptionEn: "Reached a standout star total.", level: "legendary", rarity: "legendary", score: 150, target: 1000, acceptanceId: "07-003", evaluate: (data) => data.totalStars }),
  rule({ key: "viral-repo", category: "star", en: "Viral Repo", zh: "Viral Repo", descriptionEn: "Built a single repository with viral reach.", level: "platinum", rarity: "epic", score: 120, target: 500, acceptanceId: "07-003", evaluate: (data) => maxRepo(data.repositories, (repo) => repo.stars) }),
  rule({ key: "rising-star", category: "growth-trend", en: "Rising Star", zh: "Rising Star", descriptionEn: "Shows positive recent star growth.", level: "silver", rarity: "uncommon", score: 35, target: 10, acceptanceId: "07-003", evaluate: (data) => maxRepo(data.repositoryTrends, (trend) => trend.stars) }),
  rule({ key: "monthly-spotlight", category: "growth-trend", en: "Monthly Spotlight", zh: "Monthly Spotlight", descriptionEn: "Had a strong spotlight month.", level: "gold", rarity: "rare", score: 70, target: 50, acceptanceId: "07-003", evaluate: (data) => maxRepo(data.repositoryTrends, (trend) => trend.stars) }),
  rule({ key: "popular-creator", category: "community-impact", en: "Popular Creator", zh: "Popular Creator", descriptionEn: "Created repositories with broad public interest.", level: "gold", rarity: "rare", score: 80, target: 100, acceptanceId: "07-003", evaluate: (data) => data.totalStars + data.profile.followers }),
  rule({ key: "evergreen-project", category: "star", en: "Evergreen Project", zh: "Evergreen Project", descriptionEn: "Maintains a project that continues to attract users.", level: "gold", rarity: "rare", score: 80, target: 100, acceptanceId: "07-003", evaluate: (data) => maxRepo(data.repositories.filter((repo) => !repo.isArchived), (repo) => repo.stars) }),
  rule({ key: "community-favorite", category: "community-impact", en: "Community Favorite", zh: "Community Favorite", descriptionEn: "Earned community favorites through stars and forks.", level: "platinum", rarity: "epic", score: 110, target: 250, acceptanceId: "07-003", evaluate: (data) => data.totalStars + data.totalForks * 2 }),

  // PR and Issue achievements.
  rule({ key: "first-pr", category: "pull-request", en: "First PR", zh: "First PR", descriptionEn: "Opened or merged the first pull request.", level: "bronze", rarity: "common", score: 10, target: 1, acceptanceId: "07-004", evaluate: (data) => data.pullRequests.total }),
  rule({ key: "pr-contributor", category: "pull-request", en: "PR Contributor", zh: "PR Contributor", descriptionEn: "Contributed through pull requests.", level: "silver", rarity: "uncommon", score: 25, target: 10, acceptanceId: "07-004", evaluate: (data) => data.pullRequests.total }),
  rule({ key: "pr-hero", category: "pull-request", en: "PR Hero", zh: "PR Hero", descriptionEn: "Merged many useful pull requests.", level: "gold", rarity: "rare", score: 60, target: 50, acceptanceId: "07-004", evaluate: (data) => data.pullRequests.merged }),
  rule({ key: "review-helper", category: "pull-request", en: "Review Helper", zh: "Review Helper", descriptionEn: "Helped review pull requests.", level: "silver", rarity: "uncommon", score: 25, target: 10, acceptanceId: "07-004", evaluate: (data) => data.pullRequests.reviewed }),
  rule({ key: "issue-reporter", category: "issue", en: "Issue Reporter", zh: "Issue Reporter", descriptionEn: "Reported or discussed issues.", level: "bronze", rarity: "common", score: 10, target: 1, acceptanceId: "07-004", evaluate: (data) => data.issues.total }),
  rule({ key: "bug-hunter", category: "issue", en: "Bug Hunter", zh: "Bug Hunter", descriptionEn: "Helped identify and close bugs.", level: "silver", rarity: "uncommon", score: 35, target: 10, acceptanceId: "07-004", evaluate: (data) => data.issues.closed }),
  rule({ key: "community-solver", category: "issue", en: "Community Solver", zh: "Community Solver", descriptionEn: "Resolved community issues.", level: "gold", rarity: "rare", score: 70, target: 25, acceptanceId: "07-004", evaluate: (data) => data.issues.closed + data.pullRequests.merged }),
  rule({ key: "collaboration-master", category: "community-collaboration", en: "Collaboration Master", zh: "Collaboration Master", descriptionEn: "Worked across PRs, reviews, issues, and external repositories.", level: "platinum", rarity: "epic", score: 120, target: 100, acceptanceId: "07-004", evaluate: (data) => data.pullRequests.total + data.pullRequests.reviewed + data.issues.total + data.pullRequests.externalRepositories }),
  rule({ key: "maintainer", category: "community-collaboration", en: "Maintainer", zh: "Maintainer", descriptionEn: "Maintains repositories with community interaction.", level: "gold", rarity: "rare", score: 80, target: 5, acceptanceId: "07-004", evaluate: (data) => data.repositories.filter((repo) => repo.openIssues > 0 || repo.hasDiscussions).length }),
  rule({ key: "discussion-starter", category: "community-collaboration", en: "Discussion Starter", zh: "Discussion Starter", descriptionEn: "Uses discussions or issues to start community conversations.", level: "silver", rarity: "uncommon", score: 35, target: 1, acceptanceId: "07-004", evaluate: (data) => data.repositories.filter((repo) => repo.hasDiscussions).length + data.issues.participantCount }),

  // Repository achievements.
  rule({ key: "first-repo", category: "repository", en: "First Repo", zh: "First Repo", descriptionEn: "Published the first public repository.", level: "bronze", rarity: "common", score: 10, target: 1, acceptanceId: "07-005", evaluate: (data) => data.profile.publicRepos }),
  rule({ key: "repo-builder", category: "repository", en: "Repo Builder", zh: "Repo Builder", descriptionEn: "Built multiple public repositories.", level: "silver", rarity: "uncommon", score: 25, target: 5, acceptanceId: "07-005", evaluate: (data) => data.profile.publicRepos }),
  rule({ key: "project-collector", category: "repository", en: "Project Collector", zh: "Project Collector", descriptionEn: "Collected a broad set of projects.", level: "gold", rarity: "rare", score: 60, target: 15, acceptanceId: "07-005", evaluate: (data) => data.profile.publicRepos }),
  rule({ key: "active-maintainer", category: "repository", en: "Active Maintainer", zh: "Active Maintainer", descriptionEn: "Keeps repositories active and current.", level: "gold", rarity: "rare", score: 70, target: 5, acceptanceId: "07-005", evaluate: (data) => data.repositories.filter((repo) => isRecentlyPushed(repo)).length }),
  rule({ key: "multi-language-dev", category: "language", en: "Multi-language Dev", zh: "Multi-language Dev", descriptionEn: "Worked across multiple programming languages.", level: "silver", rarity: "uncommon", score: 30, target: 3, acceptanceId: "07-005", evaluate: (data) => Object.keys(data.languages.byRepoCount).length }),
  rule({ key: "documentation-friendly", category: "repository", en: "Documentation Friendly", zh: "Documentation Friendly", descriptionEn: "Maintains repositories with useful README summaries.", level: "silver", rarity: "uncommon", score: 35, target: 3, acceptanceId: "07-005", evaluate: (data) => data.repositories.filter((repo) => Boolean(repo.description)).length }),
  rule({ key: "release-publisher", category: "repository", en: "Release Publisher", zh: "Release Publisher", descriptionEn: "Published releases or downloadable assets.", level: "gold", rarity: "rare", score: 70, target: 1, acceptanceId: "07-005", evaluate: (data) => data.repositoryTrends.filter((trend) => trend.releaseDownloads > 0).length }),
  rule({ key: "package-maker", category: "repository", en: "Package Maker", zh: "Package Maker", descriptionEn: "Built repositories that behave like packages or reusable tools.", level: "gold", rarity: "rare", score: 70, target: 1, acceptanceId: "07-005", evaluate: (data) => data.repositories.filter((repo) => repo.topics.some((topic) => /package|library|sdk|cli|plugin/i.test(topic))).length }),
  rule({ key: "topic-organizer", category: "repository", en: "Topic Organizer", zh: "Topic Organizer", descriptionEn: "Organized repositories with GitHub topics.", level: "silver", rarity: "uncommon", score: 30, target: 10, acceptanceId: "07-005", evaluate: (data) => data.repositories.reduce((total, repo) => total + repo.topics.length, 0) }),
  rule({ key: "open-source-portfolio", category: "repository", en: "Open Source Portfolio", zh: "Open Source Portfolio", descriptionEn: "Maintained a visible portfolio of repositories.", level: "gold", rarity: "rare", score: 60, target: 6, acceptanceId: "07-005", evaluate: (data) => data.profile.publicRepos }),

  // Additional category coverage required by the product spec.
  rule({ key: "fork-spark", category: "fork", en: "Fork Spark", zh: "Fork Spark", descriptionEn: "Received the first repository fork.", level: "bronze", rarity: "common", score: 10, target: 1, acceptanceId: "07-001", evaluate: (data) => data.totalForks }),
  rule({ key: "fork-magnet", category: "fork", en: "Fork Magnet", zh: "Fork Magnet", descriptionEn: "Built repositories that others fork and explore.", level: "gold", rarity: "rare", score: 70, target: 50, acceptanceId: "07-001", evaluate: (data) => data.totalForks }),
  rule({ key: "quarterly-builder", category: "quarterly", en: "Quarterly Builder", zh: "Quarterly Builder", descriptionEn: "Made meaningful progress in the current quarter.", level: "silver", rarity: "uncommon", score: 40, target: 90, acceptanceId: "07-001", evaluate: (data) => data.contributions.totalContributions }),
  rule({ key: "year-in-review", category: "annual", en: "Year in Review", zh: "Year in Review", descriptionEn: "Has enough activity for an annual GitHub summary.", level: "silver", rarity: "uncommon", score: 40, target: 100, acceptanceId: "07-007", evaluate: (data) => data.contributions.totalContributions }),
  rule({ key: "hidden-gem", category: "hidden", en: "Hidden Gem", zh: "Hidden Gem", descriptionEn: "A hidden achievement for balanced community impact.", level: "platinum", rarity: "epic", score: 100, target: 3, acceptanceId: "07-001", hidden: true, evaluate: (data) => [data.totalStars > 0, data.totalForks > 0, data.pullRequests.total > 0, data.issues.total > 0].filter(Boolean).length })
];

export function calculateAchievements(
  dataset: GitHubDataset,
  rules: AchievementRule[] = defaultAchievementRules,
  locale: StudioLocale = "en-US"
): AchievementResult[] {
  return rules.map((item) => {
    const current = Math.max(0, item.evaluate(dataset));
    const unlocked = current >= item.target;
    const percent = Math.min(100, Math.round((current / item.target) * 100));
    const name = localize(item.name, locale);
    return {
      key: item.key,
      name,
      description: localize(item.description, locale),
      icon: item.icon,
      category: item.category,
      level: item.level,
      rarity: item.rarity,
      score: item.score,
      unlocked,
      unlockedAt: unlocked ? dataset.fetchedAt : undefined,
      progress: { current, target: item.target, percent },
      readmeBadgeMarkdown: `![${name}](https://img.shields.io/badge/${encodeURIComponent(name)}-${unlocked ? "unlocked" : `${percent}%25`}-blue)`
    };
  });
}

export function achievementCategories(rules: AchievementRule[] = defaultAchievementRules): string[] {
  return [...new Set(rules.map((item) => item.category))].sort();
}

function rule(input: RuleInput & { hidden?: boolean }): AchievementRule {
  return {
    key: input.key,
    category: input.category,
    name: { en: input.en, zh: input.zh },
    description: { en: input.descriptionEn, zh: input.descriptionEn },
    icon: "trophy",
    level: input.level,
    rarity: input.rarity,
    score: input.score,
    target: input.target,
    hidden: input.hidden,
    acceptanceIds: [input.acceptanceId],
    evaluate: input.evaluate
  };
}

function maxRecord(record: Record<string, number>): number {
  return Math.max(0, ...Object.values(record));
}

function maxRepo<T>(items: T[], selector: (item: T) => number): number {
  return Math.max(0, ...items.map(selector));
}

function accountAgeYears(createdAt?: string): number {
  if (!createdAt) return 0;
  const created = new Date(createdAt).getTime();
  if (!Number.isFinite(created)) return 0;
  return Math.max(0, Math.floor((Date.now() - created) / (365.25 * 24 * 60 * 60 * 1000)));
}

function isRecentlyPushed(repo: Repository): boolean {
  if (!repo.pushedAt) return false;
  const pushed = new Date(repo.pushedAt).getTime();
  if (!Number.isFinite(pushed)) return false;
  return Date.now() - pushed < 180 * 24 * 60 * 60 * 1000;
}
