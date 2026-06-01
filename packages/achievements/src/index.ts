import type { AchievementResult, AchievementRule, GitHubDataset, StudioLocale } from "@gps/core";
import { localize } from "@gps/core";

export const defaultAchievementRules: AchievementRule[] = [
  rule("first-commit", "contribution", "First Commit", "第一次提交", "Made the first public contribution.", "完成第一次公开贡献。", "bronze", "common", 10, 1, "07-002", (data) => data.contributions.commitContributions),
  rule("weekly-builder", "contribution", "Weekly Builder", "周度构建者", "Built momentum with weekly contributions.", "形成每周贡献节奏。", "silver", "uncommon", 25, 25, "07-002", (data) => data.contributions.totalContributions),
  rule("streak-master", "streak", "Streak Master", "连续贡献大师", "Maintained a strong contribution streak.", "保持稳定连续贡献。", "gold", "rare", 50, 30, "07-002", (data) => data.contributions.longestStreak),
  rule("first-star", "star", "First Star", "第一颗 Star", "Earned the first repository star.", "获得第一颗仓库 Star。", "bronze", "common", 10, 1, "07-003", (data) => data.totalStars),
  rule("star-collector", "star", "Star Collector", "Star 收藏家", "Collected community interest across repositories.", "项目获得社区关注。", "silver", "uncommon", 30, 25, "07-003", (data) => data.totalStars),
  rule("first-pr", "pull-request", "First PR", "第一个 PR", "Opened or merged the first pull request.", "创建或合并第一个 PR。", "bronze", "common", 10, 1, "07-004", (data) => data.pullRequests.total),
  rule("review-helper", "pull-request", "Review Helper", "代码审查助手", "Helped review pull requests.", "参与 PR Review。", "silver", "uncommon", 25, 10, "07-004", (data) => data.pullRequests.reviewed),
  rule("issue-reporter", "issue", "Issue Reporter", "Issue 反馈者", "Reported or discussed issues.", "反馈或讨论 Issue。", "bronze", "common", 10, 1, "07-004", (data) => data.issues.total),
  rule("first-repo", "repository", "First Repo", "第一个仓库", "Published the first public repository.", "发布第一个公开仓库。", "bronze", "common", 10, 1, "07-005", (data) => data.profile.publicRepos),
  rule("multi-language-dev", "language", "Multi-language Dev", "多语言开发者", "Worked across multiple programming languages.", "使用多种编程语言。", "silver", "uncommon", 30, 3, "07-005", (data) => Object.keys(data.languages.byRepoCount).length),
  rule("open-source-portfolio", "repository", "Open Source Portfolio", "开源作品集", "Maintained a visible portfolio of repositories.", "维护可展示的开源作品集。", "gold", "rare", 60, 6, "07-005", (data) => data.profile.publicRepos)
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

function rule(
  key: string,
  category: string,
  en: string,
  zh: string,
  descriptionEn: string,
  descriptionZh: string,
  level: AchievementRule["level"],
  rarity: AchievementRule["rarity"],
  score: number,
  target: number,
  acceptanceId: string,
  evaluate: AchievementRule["evaluate"]
): AchievementRule {
  return {
    key,
    category,
    name: { en, zh },
    description: { en: descriptionEn, zh: descriptionZh },
    icon: "🏆",
    level,
    rarity,
    score,
    target,
    acceptanceIds: [acceptanceId],
    evaluate
  };
}

