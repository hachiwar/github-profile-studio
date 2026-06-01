import { graphql } from "@octokit/graphql";
import { Octokit } from "@octokit/rest";
import type { GitHubDataset, Repository, UserProfile } from "@gps/core";
import { demoGitHubDataset } from "@gps/core";
import { normalizeRepository, normalizeUser } from "./normalize";

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

export type GitHubDetectionResult = {
  username: string;
  userExists: boolean;
  userType?: "User" | "Organization";
  profile?: UserProfile;
  profileReadmeRepository: RepositoryStatus;
  pagesRepository: RepositoryStatus;
  recommendedMode: "new-user" | "data-enhanced" | "hybrid";
  nextActions: string[];
  rateLimit?: {
    remaining?: number;
    resetAt?: string;
  };
};

export class GitHubClient {
  private readonly rest: Octokit;
  private readonly graph: typeof graphql;

  constructor(private readonly token?: string) {
    this.rest = new Octokit({ auth: token });
    this.graph = graphql.defaults(token ? { headers: { authorization: `token ${token}` } } : {});
  }

  async getUser(username: string): Promise<UserProfile> {
    const response = await this.rest.users.getByUsername({ username });
    return normalizeUser(response.data);
  }

  async listRepositories(username: string): Promise<Repository[]> {
    const response = await this.rest.repos.listForUser({
      username,
      per_page: 100,
      sort: "updated",
      type: "owner"
    });
    return response.data.map((repo) => normalizeRepository(repo as unknown as Record<string, unknown>));
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
        nextActions: buildNextActions(profileRepo, pagesRepo, recommendedMode)
      };
    } catch (error) {
      if (isNotFound(error)) {
        return {
          username,
          userExists: false,
          profileReadmeRepository: emptyRepositoryStatus(),
          pagesRepository: emptyRepositoryStatus(),
          recommendedMode: "new-user",
          nextActions: ["Check the username spelling.", "Continue with manual new-user mode."]
        };
      }
      throw error;
    }
  }

  async detectRepository(owner: string, repo: string): Promise<RepositoryStatus> {
    try {
      const response = await this.rest.repos.get({ owner, repo });
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
      if (isNotFound(error)) return emptyRepositoryStatus();
      throw error;
    }
  }

  async getContributionDataset(username: string): Promise<GitHubDataset> {
    // The full GraphQL implementation will populate contribution days, reviews, and private visibility choices.
    // A deterministic fallback keeps generators usable when GitHub rate limits or local tests block network access.
    void this.graph;
    return demoGitHubDataset(username);
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

function isNotFound(error: unknown): boolean {
  return typeof error === "object" && error !== null && "status" in error && (error as { status?: number }).status === 404;
}

