import { graphql } from "@octokit/graphql";
import { Octokit } from "@octokit/rest";
import type { ContributionDay, ContributionStats, GitHubDataset, IssueStats, PullRequestStats, Repository, UserProfile } from "@gps/core";
import { demoGitHubDataset } from "@gps/core";
import { cached, type CacheMeta } from "./cache";
import { normalizeRepository, normalizeUser } from "./normalize";
import type { DeploymentPlan } from "./deploy";
import {
  buildDatasetFromPublicData,
  calculateLanguageStats,
  calculateStreaks,
  contributionLevel,
  estimateContributionStats,
  estimateIssueStats,
  estimatePullRequestStats
} from "./stats";

export type RepositoryStatus = {
  exists: boolean;
  isPublic: boolean;
  hasReadme: boolean;
  hasIndexHtml: boolean;
  hasWorkflows: boolean;
  defaultBranch?: string;
  pages?: {
    enabled: boolean;
    branch?: string;
    path?: string;
    url?: string;
  };
};

export type GitHubRateLimitInfo = {
  limit?: number;
  remaining?: number;
  used?: number;
  resetAt?: string;
  resource?: string;
};

export type GitHubDatasetOptions = {
  forceRefresh?: boolean;
  ttlSeconds?: number;
  staleSeconds?: number;
  year?: number;
  enrichRepositories?: boolean;
  maxEnrichmentRepos?: number;
};

export type GitHubDatasetResult = {
  dataset: GitHubDataset;
  cache: CacheMeta;
  rateLimit?: GitHubRateLimitInfo;
  warnings: string[];
};

export type GitHubDetectionResult = {
  username: string;
  userExists: boolean;
  userType?: "User" | "Organization";
  profile?: UserProfile;
  profileReadmeRepository: RepositoryStatus;
  pagesRepository: RepositoryStatus;
  recommendedMode: "new-user" | "data-enhanced" | "hybrid";
  nextActions: string[];
  rateLimit?: GitHubRateLimitInfo;
};

export type GitHubReadmeFile = {
  owner: string;
  repo: string;
  path: string;
  sha?: string;
  htmlUrl?: string;
  downloadUrl?: string;
  markdown: string;
};

export type GitHubDeploymentResult = {
  executed: boolean;
  repositoryUrl?: string;
  branch: string;
  commitUrls: string[];
  pullRequestUrl?: string;
  pagesUrl?: string;
};

type ContributionGraphQLResponse = {
  user?: {
    contributionsCollection?: {
      totalCommitContributions?: number;
      totalIssueContributions?: number;
      totalPullRequestContributions?: number;
      totalPullRequestReviewContributions?: number;
      restrictedContributionsCount?: number;
      contributionCalendar?: {
        totalContributions?: number;
        weeks?: Array<{
          contributionDays?: Array<{
            date: string;
            contributionCount: number;
            contributionLevel: "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE";
          }>;
        }>;
      };
    };
  };
  rateLimit?: {
    limit?: number;
    remaining?: number;
    used?: number;
    resetAt?: string;
  };
};

type SearchItemsResponse = {
  total_count?: number;
  items?: Array<{ repository_url?: string; pull_request?: unknown }>;
};

export class GitHubClient {
  private readonly rest: Octokit;
  private readonly graph: typeof graphql;
  private lastRateLimit?: GitHubRateLimitInfo;

  constructor(private readonly token?: string) {
    this.rest = new Octokit({ auth: token });
    this.graph = graphql.defaults(token ? { headers: { authorization: `token ${token}` } } : {});
  }

  async getUser(username: string): Promise<UserProfile> {
    const response = await this.rest.users.getByUsername({ username });
    this.rememberRateLimit(response.headers);
    return normalizeUser(response.data);
  }

  async listRepositories(username: string): Promise<Repository[]> {
    const repositories = await this.rest.paginate(this.rest.repos.listForUser, {
      username,
      per_page: 100,
      sort: "updated",
      type: "owner"
    });
    return repositories.map((repo) => normalizeRepository(repo as unknown as Record<string, unknown>));
  }

  async getAuthenticatedUser(): Promise<UserProfile> {
    const response = await this.rest.users.getAuthenticated();
    this.rememberRateLimit(response.headers);
    return normalizeUser(response.data as unknown as Record<string, unknown>);
  }

  async listAuthenticatedRepositories(): Promise<Repository[]> {
    const repositories = await this.rest.paginate(this.rest.repos.listForAuthenticatedUser, {
      affiliation: "owner",
      visibility: "all",
      per_page: 100,
      sort: "updated"
    });
    return repositories.map((repo) => normalizeRepository(repo as unknown as Record<string, unknown>));
  }

  async getDataset(username: string, options: GitHubDatasetOptions = {}): Promise<GitHubDatasetResult> {
    const normalizedUsername = username.trim();
    const warnings: string[] = [];
    const result = await cached({
      key: `github:dataset:${normalizedUsername.toLowerCase()}:${options.year ?? new Date().getFullYear()}`,
      ttlSeconds: options.ttlSeconds ?? 900,
      staleSeconds: options.staleSeconds ?? 86_400,
      forceRefresh: options.forceRefresh,
      shouldFallback: (error) => !isGitHubNotFound(error),
      fallback: () => demoGitHubDataset(normalizedUsername),
      loader: async () => {
        const profile = await this.getUser(normalizedUsername);
        const rawRepositories = await this.listRepositories(normalizedUsername);
        const repositories =
          options.enrichRepositories === false
            ? rawRepositories
            : await this.enrichRepositories(rawRepositories, options.maxEnrichmentRepos ?? 12, warnings);
        const contributionStats = await this.loadContributionStats(normalizedUsername, repositories, profile, options.year, warnings);
        const [pullRequests, issues] = await Promise.all([
          this.loadPullRequestStats(normalizedUsername, contributionStats, repositories, warnings),
          this.loadIssueStats(normalizedUsername, contributionStats, repositories, warnings)
        ]);
        const languageBytes = Object.fromEntries(repositories.map((repo) => [repo.fullName, repo.languages ?? {}]));

        return buildDatasetFromPublicData({
          profile,
          repositories,
          contributions: contributionStats,
          pullRequests,
          issues,
          languages: calculateLanguageStats(repositories, languageBytes),
          year: options.year
        });
      }
    });

    if (result.cache.degraded && result.cache.reason) warnings.push(result.cache.reason);
    return {
      dataset: result.value,
      cache: result.cache,
      rateLimit: this.lastRateLimit,
      warnings
    };
  }

  async detect(username: string): Promise<GitHubDetectionResult> {
    try {
      const profile = await this.getUser(username);
      const [profileRepo, pagesRepo] = await Promise.all([
        this.detectRepository(username, username),
        this.detectRepository(username, `${username}.github.io`)
      ]);
      const recommendedMode = recommendMode(profile, profileRepo);

      return {
        username,
        userExists: true,
        userType: "User",
        profile,
        profileReadmeRepository: profileRepo,
        pagesRepository: pagesRepo,
        recommendedMode,
        nextActions: buildNextActions(profileRepo, pagesRepo, recommendedMode),
        rateLimit: this.lastRateLimit
      };
    } catch (error) {
      if (isGitHubNotFound(error)) {
        return {
          username,
          userExists: false,
          profileReadmeRepository: emptyRepositoryStatus(),
          pagesRepository: emptyRepositoryStatus(),
          recommendedMode: "new-user",
          nextActions: ["Check the username spelling.", "Continue with manual new-user mode."],
          rateLimit: this.lastRateLimit
        };
      }
      throw error;
    }
  }

  async detectRepository(owner: string, repo: string): Promise<RepositoryStatus> {
    try {
      const response = await this.rest.repos.get({ owner, repo });
      this.rememberRateLimit(response.headers);
      const [readme, index, workflows, pages] = await Promise.allSettled([
        this.rest.repos.getReadme({ owner, repo }),
        this.rest.repos.getContent({ owner, repo, path: "index.html" }),
        this.rest.repos.getContent({ owner, repo, path: ".github/workflows" }),
        this.rest.repos.getPages({ owner, repo })
      ]);

      return {
        exists: true,
        isPublic: !response.data.private,
        hasReadme: readme.status === "fulfilled",
        hasIndexHtml: index.status === "fulfilled",
        hasWorkflows: workflows.status === "fulfilled",
        defaultBranch: response.data.default_branch,
        pages:
          pages.status === "fulfilled"
            ? {
                enabled: true,
                branch: pages.value.data.source?.branch,
                path: pages.value.data.source?.path,
                url: pages.value.data.html_url
              }
            : { enabled: false }
      };
    } catch (error) {
      if (isGitHubNotFound(error)) return emptyRepositoryStatus();
      throw error;
    }
  }

  async getReadmeMarkdown(owner: string, repo: string, ref?: string): Promise<GitHubReadmeFile> {
    const response = await this.rest.repos.getReadme({ owner, repo, ref });
    this.rememberRateLimit(response.headers);
    const data = response.data;
    if (!("content" in data) || typeof data.content !== "string") throw new Error("README_NOT_FOUND");
    return {
      owner,
      repo,
      path: data.path,
      sha: data.sha,
      htmlUrl: data.html_url ?? undefined,
      downloadUrl: data.download_url ?? undefined,
      markdown: decodeBase64Content(data.content)
    };
  }

  async executeDeploymentPlan(plan: DeploymentPlan): Promise<GitHubDeploymentResult> {
    if (!this.token) throw new Error("OAUTH_REQUIRED");
    const user = await this.getAuthenticatedUser();
    const owner = user.githubUsername;
    const repository = await this.ensureRepository(owner, plan.repository);
    const branch = plan.mode === "pull-request" ? await this.createDeploymentBranch(owner, plan.repository, plan.branch) : plan.branch;
    const commitUrls: string[] = [];

    for (const file of plan.files) {
      const current = await this.getFileSha(owner, plan.repository, file.path, branch);
      const response = await this.rest.repos.createOrUpdateFileContents({
        owner,
        repo: plan.repository,
        path: file.path,
        message: `${plan.commitMessage}: ${file.path}`,
        content: Buffer.from(file.content, "utf8").toString("base64"),
        branch,
        sha: current
      });
      this.rememberRateLimit(response.headers);
      if (response.data.commit?.html_url) commitUrls.push(response.data.commit.html_url);
    }

    const pullRequestUrl =
      plan.mode === "pull-request"
        ? await this.createDeploymentPullRequest(owner, plan.repository, branch, plan.branch, plan.commitMessage)
        : undefined;
    const pagesUrl = plan.target === "pages" ? await this.enablePages(owner, plan.repository, plan.branch, "/") : undefined;

    return {
      executed: true,
      repositoryUrl: repository.html_url,
      branch,
      commitUrls,
      pullRequestUrl,
      pagesUrl
    };
  }

  async enablePagesForRepository(owner: string, repo: string, branch = "main", path = "/"): Promise<string | undefined> {
    await this.ensureRepository(owner, repo);
    return this.enablePages(owner, repo, branch, path);
  }

  async getContributionDataset(username: string): Promise<GitHubDataset> {
    return (await this.getDataset(username)).dataset;
  }

  private async enrichRepositories(repositories: Repository[], maxRepos: number, warnings: string[]): Promise<Repository[]> {
    const visible = repositories.filter((repo) => !repo.isPrivate && !repo.isArchived).slice(0, maxRepos);
    const enriched = new Map<string, Repository>();

    await Promise.all(
      visible.map(async (repo) => {
        enriched.set(repo.fullName, await this.enrichRepository(repo, warnings));
      })
    );

    return repositories.map((repo) => enriched.get(repo.fullName) ?? repo);
  }

  private async enrichRepository(repo: Repository, warnings: string[]): Promise<Repository> {
    const owner = repo.owner || repo.fullName.split("/")[0];
    const [languages, contributors, releases, readmeSummary] = await Promise.allSettled([
      this.rest.repos.listLanguages({ owner, repo: repo.name }),
      this.rest.repos.listContributors({ owner, repo: repo.name, per_page: 100, anon: "true" }),
      this.rest.repos.listReleases({ owner, repo: repo.name, per_page: 20 }),
      this.rest.repos.getReadme({ owner, repo: repo.name })
    ]);

    if (languages.status === "fulfilled") this.rememberRateLimit(languages.value.headers);
    if (contributors.status === "fulfilled") this.rememberRateLimit(contributors.value.headers);
    if (releases.status === "fulfilled") this.rememberRateLimit(releases.value.headers);
    if (readmeSummary.status === "fulfilled") this.rememberRateLimit(readmeSummary.value.headers);

    if (languages.status === "rejected") warnings.push(`repo languages unavailable for ${repo.fullName}`);
    if (contributors.status === "rejected") warnings.push(`contributors unavailable for ${repo.fullName}`);
    if (releases.status === "rejected") warnings.push(`releases unavailable for ${repo.fullName}`);
    if (readmeSummary.status === "rejected") warnings.push(`README summary unavailable for ${repo.fullName}`);

    const releaseItems = releases.status === "fulfilled" ? releases.value.data : [];
    const releaseDownloads = releaseItems.reduce(
      (total, release) => total + release.assets.reduce((assetTotal, asset) => assetTotal + (asset.download_count ?? 0), 0),
      0
    );

    return {
      ...repo,
      languages: languages.status === "fulfilled" ? normalizeLanguageBytes(languages.value.data) : repo.languages,
      contributors: contributors.status === "fulfilled" ? contributors.value.data.length : repo.contributors,
      releaseCount: releases.status === "fulfilled" ? releaseItems.length : repo.releaseCount,
      latestReleaseAt: releaseItems[0]?.published_at ?? releaseItems[0]?.created_at ?? repo.latestReleaseAt,
      releaseDownloads: releases.status === "fulfilled" ? releaseDownloads : repo.releaseDownloads,
      readmeSummary:
        readmeSummary.status === "fulfilled" && "content" in readmeSummary.value.data
          ? summarizeReadme(decodeBase64Content(readmeSummary.value.data.content))
          : repo.readmeSummary
    };
  }

  private async loadContributionStats(
    username: string,
    repositories: Repository[],
    profile: UserProfile,
    year = new Date().getFullYear(),
    warnings: string[]
  ): Promise<ContributionStats> {
    if (!this.token) return estimateContributionStats(username, repositories, profile, year);

    try {
      const from = `${year}-01-01T00:00:00Z`;
      const to = `${year}-12-31T23:59:59Z`;
      const response = await this.graph<ContributionGraphQLResponse>(
        `query ProfileStudioContributions($login: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $login) {
            contributionsCollection(from: $from, to: $to) {
              totalCommitContributions
              totalIssueContributions
              totalPullRequestContributions
              totalPullRequestReviewContributions
              restrictedContributionsCount
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    date
                    contributionCount
                    contributionLevel
                  }
                }
              }
            }
          }
          rateLimit {
            limit
            remaining
            used
            resetAt
          }
        }`,
        { login: username, from, to }
      );
      if (response.rateLimit) this.lastRateLimit = { ...response.rateLimit, resource: "graphql" };
      const collection = response.user?.contributionsCollection;
      if (!collection?.contributionCalendar?.weeks) throw new Error("CONTRIBUTION_GRAPHQL_EMPTY");

      const contributionDays = collection.contributionCalendar.weeks.flatMap((week) =>
        (week.contributionDays ?? []).map((day) => ({
          date: day.date,
          count: day.contributionCount,
          level: contributionLevelFromGraphQL(day.contributionLevel, day.contributionCount)
        }))
      );
      const monthStats = monthlyStats(contributionDays);
      const weekStats = weeklyStats(contributionDays);
      const streaks = calculateStreaks(contributionDays);

      return {
        username,
        year,
        totalContributions: collection.contributionCalendar.totalContributions ?? contributionDays.reduce((total, day) => total + day.count, 0),
        commitContributions: collection.totalCommitContributions ?? 0,
        issueContributions: collection.totalIssueContributions ?? 0,
        pullRequestContributions: collection.totalPullRequestContributions ?? 0,
        reviewContributions: collection.totalPullRequestReviewContributions ?? 0,
        currentStreak: streaks.currentStreak,
        longestStreak: streaks.longestStreak,
        contributionDays,
        monthlyStats: monthStats,
        weeklyStats: weekStats,
        hourlyStats: estimateContributionStats(username, repositories, profile, year).hourlyStats,
        restrictedContributions: collection.restrictedContributionsCount
      };
    } catch (error) {
      warnings.push(`contribution GraphQL fallback: ${error instanceof Error ? error.message : "unknown error"}`);
      return estimateContributionStats(username, repositories, profile, year);
    }
  }

  private async loadPullRequestStats(
    username: string,
    contributions: ContributionStats,
    repositories: Repository[],
    warnings: string[]
  ): Promise<PullRequestStats> {
    try {
      const currentYear = new Date().getFullYear();
      const [all, merged, closed, recent] = await Promise.all([
        this.searchIssues(`author:${username} type:pr`),
        this.searchIssues(`author:${username} type:pr is:merged`),
        this.searchIssues(`author:${username} type:pr is:closed`),
        this.searchIssues(`author:${username} type:pr created:>=${currentYear}-01-01`)
      ]);
      const externalRepositories = countExternalRepositories(all.items ?? [], username);
      const organizations = countOrganizations(all.items ?? []);
      return {
        total: all.total_count ?? contributions.pullRequestContributions,
        merged: merged.total_count ?? 0,
        closed: Math.max(0, (closed.total_count ?? 0) - (merged.total_count ?? 0)),
        reviewed: contributions.reviewContributions,
        recentYear: recent.total_count ?? contributions.pullRequestContributions,
        mergeRate: percentage(merged.total_count ?? 0, all.total_count ?? 0),
        externalRepositories,
        organizations
      };
    } catch (error) {
      warnings.push(`pull request search fallback: ${error instanceof Error ? error.message : "unknown error"}`);
      return estimatePullRequestStats(contributions, repositories);
    }
  }

  private async loadIssueStats(username: string, contributions: ContributionStats, repositories: Repository[], warnings: string[]): Promise<IssueStats> {
    try {
      const currentYear = new Date().getFullYear();
      const [all, closed, recent] = await Promise.all([
        this.searchIssues(`author:${username} type:issue`),
        this.searchIssues(`author:${username} type:issue is:closed`),
        this.searchIssues(`author:${username} type:issue created:>=${currentYear}-01-01`)
      ]);
      return {
        total: all.total_count ?? contributions.issueContributions,
        closed: closed.total_count ?? 0,
        recentYear: recent.total_count ?? contributions.issueContributions,
        closeRate: percentage(closed.total_count ?? 0, all.total_count ?? 0),
        participantCount: countOrganizations(all.items ?? []) + repositories.reduce((sum, repo) => sum + (repo.contributors ?? 0), 0)
      };
    } catch (error) {
      warnings.push(`issue search fallback: ${error instanceof Error ? error.message : "unknown error"}`);
      return estimateIssueStats(contributions, repositories);
    }
  }

  private async searchIssues(query: string): Promise<SearchItemsResponse> {
    const response = await this.rest.search.issuesAndPullRequests({
      q: query,
      per_page: 50
    });
    this.rememberRateLimit(response.headers);
    return response.data as SearchItemsResponse;
  }

  private async ensureRepository(owner: string, repo: string) {
    try {
      const response = await this.rest.repos.get({ owner, repo });
      this.rememberRateLimit(response.headers);
      return response.data;
    } catch (error) {
      if (!isGitHubNotFound(error)) throw error;
      const response = await this.rest.repos.createForAuthenticatedUser({
        name: repo,
        private: false,
        auto_init: true,
        description: repo.endsWith(".github.io") ? "GitHub Pages site generated by GitHub Profile Studio." : "GitHub Profile README generated by GitHub Profile Studio."
      });
      this.rememberRateLimit(response.headers);
      return response.data;
    }
  }

  private async createDeploymentBranch(owner: string, repo: string, baseBranch: string): Promise<string> {
    const branchName = `profile-studio-${Date.now().toString(36)}`;
    const base = await this.rest.repos.getBranch({ owner, repo, branch: baseBranch });
    this.rememberRateLimit(base.headers);
    const response = await this.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: base.data.commit.sha
    });
    this.rememberRateLimit(response.headers);
    return branchName;
  }

  private async getFileSha(owner: string, repo: string, path: string, ref: string): Promise<string | undefined> {
    try {
      const response = await this.rest.repos.getContent({ owner, repo, path, ref });
      this.rememberRateLimit(response.headers);
      const data = response.data;
      return !Array.isArray(data) && "sha" in data ? data.sha : undefined;
    } catch (error) {
      if (isGitHubNotFound(error)) return undefined;
      throw error;
    }
  }

  private async createDeploymentPullRequest(owner: string, repo: string, head: string, base: string, title: string): Promise<string | undefined> {
    const response = await this.rest.pulls.create({
      owner,
      repo,
      head,
      base,
      title,
      body: "Generated by GitHub Profile Studio. Review the diff before merging."
    });
    this.rememberRateLimit(response.headers);
    return response.data.html_url;
  }

  private async enablePages(owner: string, repo: string, branch: string, path: string): Promise<string | undefined> {
    try {
      const createPagesSite = (this.rest.repos as unknown as {
        createPagesSite?: (input: { owner: string; repo: string; source: { branch: string; path: string } }) => Promise<{ data: { html_url?: string }; headers: Record<string, string | number | undefined> }>;
        updateInformationAboutPagesSite?: (input: { owner: string; repo: string; source: { branch: string; path: string } }) => Promise<{ data: { html_url?: string }; headers: Record<string, string | number | undefined> }>;
      }).createPagesSite;
      if (!createPagesSite) return undefined;
      const response = await createPagesSite({ owner, repo, source: { branch, path } });
      this.rememberRateLimit(response.headers);
      return response.data.html_url;
    } catch (error) {
      const updatePages = (this.rest.repos as unknown as {
        updateInformationAboutPagesSite?: (input: { owner: string; repo: string; source: { branch: string; path: string } }) => Promise<{ data: { html_url?: string }; headers: Record<string, string | number | undefined> }>;
      }).updateInformationAboutPagesSite;
      if (!updatePages) throw error;
      const response = await updatePages({ owner, repo, source: { branch, path } });
      this.rememberRateLimit(response.headers);
      return response.data.html_url;
    }
  }

  private rememberRateLimit(headers: Record<string, string | number | undefined>): void {
    const limit = toNumber(headers["x-ratelimit-limit"]);
    const remaining = toNumber(headers["x-ratelimit-remaining"]);
    const used = toNumber(headers["x-ratelimit-used"]);
    const reset = toNumber(headers["x-ratelimit-reset"]);
    const resource = typeof headers["x-ratelimit-resource"] === "string" ? headers["x-ratelimit-resource"] : undefined;
    if (limit === undefined && remaining === undefined && reset === undefined) return;
    this.lastRateLimit = {
      limit,
      remaining,
      used,
      resetAt: reset ? new Date(reset * 1000).toISOString() : undefined,
      resource
    };
  }
}

export function emptyRepositoryStatus(): RepositoryStatus {
  return {
    exists: false,
    isPublic: false,
    hasReadme: false,
    hasIndexHtml: false,
    hasWorkflows: false,
    pages: { enabled: false }
  };
}

export function isGitHubNotFound(error: unknown): boolean {
  return typeof error === "object" && error !== null && "status" in error && (error as { status?: number }).status === 404;
}

export function isGitHubRateLimited(error: unknown): boolean {
  return typeof error === "object" && error !== null && "status" in error && (error as { status?: number }).status === 403;
}

function recommendMode(profile: UserProfile, profileRepo: RepositoryStatus): "new-user" | "data-enhanced" | "hybrid" {
  if (profile.publicRepos <= 2 || !profileRepo.exists || profile.followers < 5) return "new-user";
  if (profile.publicRepos >= 8 && profile.followers >= 20) return "data-enhanced";
  return "hybrid";
}

function buildNextActions(profileRepo: RepositoryStatus, pagesRepo: RepositoryStatus, mode: string): string[] {
  const actions: string[] = [];
  if (!profileRepo.exists) actions.push("Create the username repository for Profile README.");
  if (!profileRepo.hasReadme) actions.push("Generate and commit README.md.");
  if (!pagesRepo.exists) actions.push("Create username.github.io for GitHub Pages.");
  if (!pagesRepo.pages?.enabled) actions.push("Enable GitHub Pages and publish the generated site.");
  if (mode === "new-user") actions.push("Fill the new-user form to avoid empty GitHub data modules.");
  return actions;
}

function normalizeLanguageBytes(input: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => Number.isFinite(value) && value > 0));
}

function summarizeReadme(markdown: string): string {
  const text = markdown
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("#") && !line.includes("shields.io") && !line.includes("<img"))
    .join(" ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\[[^\]]+\]\([^)]+\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 220 ? `${text.slice(0, 217)}...` : text;
}

function decodeBase64Content(content: string): string {
  const normalized = content.replace(/\s/g, "");
  if (typeof Buffer !== "undefined") return Buffer.from(normalized, "base64").toString("utf8");
  if (typeof atob !== "undefined") return atob(normalized);
  return "";
}

function contributionLevelFromGraphQL(level: string, count: number): ContributionDay["level"] {
  if (level === "FIRST_QUARTILE") return 1;
  if (level === "SECOND_QUARTILE") return 2;
  if (level === "THIRD_QUARTILE") return 3;
  if (level === "FOURTH_QUARTILE") return 4;
  return contributionLevel(count);
}

function monthlyStats(days: ContributionDay[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const day of days) {
    const month = new Date(`${day.date}T00:00:00.000Z`).toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    result[month] = (result[month] ?? 0) + day.count;
  }
  return result;
}

function weeklyStats(days: ContributionDay[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const day of days) {
    const weekday = new Date(`${day.date}T00:00:00.000Z`).toLocaleString("en-US", { weekday: "short", timeZone: "UTC" });
    result[weekday] = (result[weekday] ?? 0) + day.count;
  }
  return result;
}

function countExternalRepositories(items: NonNullable<SearchItemsResponse["items"]>, username: string): number {
  const lowerUsername = username.toLowerCase();
  return new Set(items.map((item) => parseRepositoryFullName(item.repository_url)).filter((repo) => repo && !repo.toLowerCase().startsWith(`${lowerUsername}/`))).size;
}

function countOrganizations(items: NonNullable<SearchItemsResponse["items"]>): number {
  return new Set(items.map((item) => parseRepositoryFullName(item.repository_url)?.split("/")[0]).filter(Boolean)).size;
}

function parseRepositoryFullName(repositoryUrl?: string): string | undefined {
  if (!repositoryUrl) return undefined;
  const marker = "/repos/";
  const index = repositoryUrl.indexOf(marker);
  return index >= 0 ? repositoryUrl.slice(index + marker.length) : undefined;
}

function percentage(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function toNumber(value: string | number | undefined): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
