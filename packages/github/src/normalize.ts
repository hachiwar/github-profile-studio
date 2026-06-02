import type { Repository, UserProfile } from "@gps/core";

type GitHubUserResponse = Record<string, unknown>;
type GitHubRepoResponse = Record<string, unknown>;

export function normalizeUser(payload: GitHubUserResponse): UserProfile {
  const createdAt = stringOrUndefined(payload.created_at);
  const accountAge = calculateAccountAge(createdAt);
  return {
    githubUsername: String(payload.login ?? ""),
    githubId: typeof payload.id === "number" ? payload.id : undefined,
    displayName: stringOrUndefined(payload.name),
    avatarUrl: stringOrUndefined(payload.avatar_url),
    bio: stringOrUndefined(payload.bio),
    company: stringOrUndefined(payload.company),
    location: stringOrUndefined(payload.location),
    blog: normalizeUrl(stringOrUndefined(payload.blog)),
    email: stringOrUndefined(payload.email),
    followers: numberOrZero(payload.followers),
    following: numberOrZero(payload.following),
    publicRepos: numberOrZero(payload.public_repos),
    publicGists: numberOrZero(payload.public_gists),
    createdAt,
    accountAgeDays: accountAge.days,
    accountAgeYears: accountAge.years,
    lastFetchedAt: new Date().toISOString()
  };
}

export function normalizeRepository(payload: GitHubRepoResponse): Repository {
  return {
    githubRepoId: numberOrZero(payload.id),
    owner: String((payload.owner as { login?: unknown } | undefined)?.login ?? ""),
    name: String(payload.name ?? ""),
    fullName: String(payload.full_name ?? ""),
    description: stringOrUndefined(payload.description),
    homepage: normalizeUrl(stringOrUndefined(payload.homepage)),
    language: stringOrUndefined(payload.language),
    topics: Array.isArray(payload.topics) ? payload.topics.map(String) : [],
    license: stringOrUndefined((payload.license as { spdx_id?: unknown } | undefined)?.spdx_id),
    stars: numberOrZero(payload.stargazers_count),
    forks: numberOrZero(payload.forks_count),
    watchers: numberOrZero(payload.watchers_count),
    subscribers: numberOrZero(payload.subscribers_count),
    openIssues: numberOrZero(payload.open_issues_count),
    size: numberOrZero(payload.size),
    defaultBranch: String(payload.default_branch ?? "main"),
    isFork: Boolean(payload.fork),
    isArchived: Boolean(payload.archived),
    isPrivate: Boolean(payload.private),
    isTemplate: Boolean(payload.is_template),
    isDisabled: Boolean(payload.disabled),
    visibility:
      payload.visibility === "private" || payload.visibility === "internal" || payload.visibility === "public"
        ? payload.visibility
        : Boolean(payload.private)
          ? "private"
          : "public",
    hasPages: Boolean(payload.has_pages),
    hasWiki: Boolean(payload.has_wiki),
    hasDiscussions: Boolean(payload.has_discussions),
    createdAt: stringOrUndefined(payload.created_at),
    updatedAt: stringOrUndefined(payload.updated_at),
    pushedAt: stringOrUndefined(payload.pushed_at)
  };
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
}

function calculateAccountAge(createdAt: string | undefined): { days?: number; years?: number } {
  if (!createdAt) return {};
  const created = Date.parse(createdAt);
  if (!Number.isFinite(created)) return {};
  const days = Math.max(0, Math.floor((Date.now() - created) / (24 * 60 * 60 * 1000)));
  return {
    days,
    years: Number((days / 365.2425).toFixed(2))
  };
}
