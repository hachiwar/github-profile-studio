import type { PageSiteBundle } from "@gps/core";

export type DeploymentFile = {
  path: string;
  content: string;
  encoding: "utf-8" | "base64";
};

export type DeploymentPlan = {
  username: string;
  repository: string;
  target: "readme" | "pages" | "actions";
  mode: "direct-commit" | "pull-request";
  branch: string;
  commitMessage: string;
  files: DeploymentFile[];
  backupRequired: boolean;
  rollbackLabel: string;
};

export type FileDiff = {
  path: string;
  status: "added" | "modified" | "deleted" | "unchanged";
  oldHash?: string;
  newHash: string;
};

export function createReadmeDeploymentPlan(input: {
  username: string;
  markdown: string;
  mode?: "direct-commit" | "pull-request";
  branch?: string;
}): DeploymentPlan {
  return {
    username: input.username,
    repository: input.username,
    target: "readme",
    mode: input.mode ?? "pull-request",
    branch: input.branch ?? "main",
    commitMessage: "docs: update GitHub Profile README",
    files: [{ path: "README.md", content: input.markdown, encoding: "utf-8" }],
    backupRequired: true,
    rollbackLabel: `readme-${new Date().toISOString()}`
  };
}

export function createPagesDeploymentPlan(input: {
  username: string;
  bundle: PageSiteBundle;
  mode?: "direct-commit" | "pull-request";
  branch?: string;
}): DeploymentPlan {
  return {
    username: input.username,
    repository: `${input.username}.github.io`,
    target: "pages",
    mode: input.mode ?? "pull-request",
    branch: input.branch ?? "main",
    commitMessage: "site: update generated GitHub Pages site",
    files: Object.entries(input.bundle.files).map(([path, content]) => ({ path, content, encoding: "utf-8" })),
    backupRequired: true,
    rollbackLabel: `pages-${new Date().toISOString()}`
  };
}

export function buildDiff(files: DeploymentFile[], existingHashes: Record<string, string> = {}): FileDiff[] {
  return files.map((file) => {
    const newHash = hashContent(file.content);
    const oldHash = existingHashes[file.path];
    return {
      path: file.path,
      status: oldHash ? (oldHash === newHash ? "unchanged" : "modified") : "added",
      oldHash,
      newHash
    };
  });
}

function hashContent(content: string): string {
  let hash = 0;
  for (let index = 0; index < content.length; index += 1) {
    hash = (hash * 31 + content.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

