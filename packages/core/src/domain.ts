import { z } from "zod";
import type { LocalizedText, StudioLocale } from "./language";

export const generationModeSchema = z.enum(["new-user", "data-enhanced", "hybrid", "manual"]);
export type GenerationMode = z.infer<typeof generationModeSchema>;

export const targetTypeSchema = z.enum(["readme", "pages", "cards", "achievements"]);
export type TargetType = z.infer<typeof targetTypeSchema>;

export const privacyScopeSchema = z.enum(["readme", "pages", "both"]);
export type PrivacyScope = z.infer<typeof privacyScopeSchema>;

export const socialLinkSchema = z.object({
  provider: z.string(),
  label: z.string(),
  url: z.string().url(),
  showInReadme: z.boolean().default(true),
  showInPages: z.boolean().default(true)
});

export type SocialLink = z.infer<typeof socialLinkSchema>;

export const skillSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["frontend", "backend", "database", "ai-data", "devops", "language", "testing", "cloud", "other"]),
  proficiency: z.number().min(0).max(100),
  status: z.enum(["learning", "daily-use", "primary", "interested"]),
  showIcon: z.boolean().default(true),
  showBadge: z.boolean().default(true),
  showInReadme: z.boolean().default(true),
  showInPages: z.boolean().default(true)
});

export type Skill = z.infer<typeof skillSchema>;

export const educationSchema = z.object({
  school: z.string().optional(),
  department: z.string().optional(),
  major: z.string().optional(),
  degree: z.string().optional(),
  startYear: z.number().optional(),
  graduationYear: z.number().optional(),
  grade: z.string().optional(),
  courses: z.array(z.string()).default([]),
  honors: z.array(z.string()).default([]),
  showInReadme: z.boolean().default(true),
  showInPages: z.boolean().default(true)
});

export type Education = z.infer<typeof educationSchema>;

export const manualProjectSchema = z.object({
  name: z.string().min(1),
  summary: z.string().min(1),
  type: z.enum(["personal", "course", "competition", "team", "open-source", "planned"]),
  status: z.enum(["planned", "building", "completed", "maintained"]),
  techStack: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  role: z.string().optional(),
  repoUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  featured: z.boolean().default(false),
  showInReadme: z.boolean().default(true),
  showInPages: z.boolean().default(true)
});

export type ManualProject = z.infer<typeof manualProjectSchema>;

export const learningPlanSchema = z.object({
  currentFocus: z.array(z.string()).default([]),
  books: z.array(z.string()).default([]),
  courses: z.array(z.string()).default([]),
  currentProjects: z.array(z.string()).default([]),
  shortTermGoals: z.array(z.string()).default([]),
  longTermGoals: z.array(z.string()).default([]),
  openSourcePlan: z.string().optional(),
  jobPlan: z.string().optional(),
  showInReadme: z.boolean().default(true),
  showInPages: z.boolean().default(true)
});

export type LearningPlan = z.infer<typeof learningPlanSchema>;

export const userProfileSchema = z.object({
  githubUsername: z.string().min(1),
  githubId: z.number().optional(),
  accountType: z.enum(["User", "Organization"]).optional(),
  displayName: z.string().optional(),
  nickname: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().optional(),
  currentRole: z.string().optional(),
  status: z.string().optional(),
  location: z.string().optional(),
  company: z.string().optional(),
  blog: z.string().url().optional(),
  email: z.string().email().optional(),
  followers: z.number().default(0),
  following: z.number().default(0),
  publicRepos: z.number().default(0),
  publicGists: z.number().default(0),
  createdAt: z.string().optional(),
  accountAgeDays: z.number().optional(),
  accountAgeYears: z.number().optional(),
  lastFetchedAt: z.string().optional()
});

export type UserProfile = z.infer<typeof userProfileSchema>;

export type Repository = {
  githubRepoId: number;
  owner: string;
  name: string;
  fullName: string;
  description?: string;
  homepage?: string;
  language?: string;
  topics: string[];
  license?: string;
  stars: number;
  forks: number;
  watchers: number;
  subscribers: number;
  openIssues: number;
  size: number;
  defaultBranch: string;
  isFork: boolean;
  isArchived: boolean;
  isPrivate: boolean;
  isTemplate?: boolean;
  isDisabled?: boolean;
  visibility?: "public" | "private" | "internal";
  hasPages: boolean;
  hasWiki: boolean;
  hasDiscussions: boolean;
  contributors?: number;
  languages?: Record<string, number>;
  readmeSummary?: string;
  releaseCount?: number;
  latestReleaseAt?: string;
  releaseDownloads?: number;
  createdAt?: string;
  updatedAt?: string;
  pushedAt?: string;
};

export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type ContributionStats = {
  username: string;
  year: number;
  totalContributions: number;
  commitContributions: number;
  issueContributions: number;
  pullRequestContributions: number;
  reviewContributions: number;
  currentStreak: number;
  longestStreak: number;
  contributionDays: ContributionDay[];
  monthlyStats: Record<string, number>;
  weeklyStats: Record<string, number>;
  hourlyStats: Record<string, number>;
  restrictedContributions?: number;
};

export type RepositoryTrend = {
  repoFullName: string;
  date: string;
  stars: number;
  forks: number;
  issues: number;
  watchers: number;
  subscribers: number;
  contributors: number;
  releaseDownloads: number;
  snapshotSource: "github-api" | "stargazer-backfill" | "scheduled-snapshot";
};

export type PullRequestStats = {
  total: number;
  merged: number;
  closed: number;
  reviewed: number;
  recentYear: number;
  mergeRate: number;
  externalRepositories: number;
  organizations: number;
};

export type IssueStats = {
  total: number;
  closed: number;
  recentYear: number;
  closeRate: number;
  participantCount: number;
};

export type LanguageStats = {
  byRepoCount: Record<string, number>;
  byBytes: Record<string, number>;
  recentYear: Record<string, number>;
  starWeighted: Record<string, number>;
  forkWeighted: Record<string, number>;
};

export type GitHubDataset = {
  profile: UserProfile;
  repositories: Repository[];
  contributions: ContributionStats;
  repositoryTrends: RepositoryTrend[];
  pullRequests: PullRequestStats;
  issues: IssueStats;
  languages: LanguageStats;
  totalStars: number;
  totalForks: number;
  technologyTags: string[];
  fetchedAt: string;
};

export type PrivacySetting = {
  key: string;
  label: LocalizedText;
  sensitive: boolean;
  scope: PrivacyScope;
  visibleInReadme: boolean;
  visibleInPages: boolean;
  obfuscation?: string;
};

export type ProfileStudioConfig = {
  locale: StudioLocale;
  mode: GenerationMode;
  targetUsername: string;
  profile: UserProfile;
  education: Education[];
  skills: Skill[];
  learningPlan: LearningPlan;
  manualProjects: ManualProject[];
  socialLinks: SocialLink[];
  themeKey: string;
  readmeTemplateKey: string;
  pageTemplateKey: string;
  enabledReadmeModules: string[];
  enabledPageSections: string[];
  privacy: PrivacySetting[];
  github?: GitHubDataset;
};

export type GeneratedReadme = {
  markdown: string;
  modules: Array<{ id: string; label: LocalizedText; acceptanceIds: string[] }>;
  warnings: string[];
};

export type PageSiteBundle = {
  files: Record<string, string>;
  sections: string[];
  warnings: string[];
};

export type CardRequest = {
  type: string;
  user: string;
  locale: StudioLocale;
  dataset: GitHubDataset;
  theme: string;
  format: "svg" | "png" | "json";
  repo?: string;
  period?: "7d" | "30d" | "90d" | "365d" | "all";
  layout?: "default" | "compact" | "wide" | "grid";
  hideBorder?: boolean;
  borderRadius?: number;
  bgColor?: string;
  titleColor?: string;
  textColor?: string;
  iconColor?: string;
  width?: number;
  height?: number;
  showIcons?: boolean;
  hide?: string[];
  include?: string[];
  cacheSeconds?: number;
  animation?: "none" | "subtle" | "pulse";
};

export type AchievementRule = {
  key: string;
  category: string;
  name: LocalizedText;
  description: LocalizedText;
  icon: string;
  level: "bronze" | "silver" | "gold" | "platinum" | "legendary";
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  score: number;
  target: number;
  hidden?: boolean;
  acceptanceIds: string[];
  evaluate: (dataset: GitHubDataset) => number;
};

export type AchievementResult = {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  level: AchievementRule["level"];
  rarity: AchievementRule["rarity"];
  score: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress: {
    current: number;
    target: number;
    percent: number;
  };
  readmeBadgeMarkdown: string;
};
