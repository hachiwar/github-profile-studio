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

export type DeploymentOperation = {
  order: number;
  action:
    | "check-auth"
    | "ensure-repository"
    | "read-current-files"
    | "create-backup"
    | "write-files"
    | "create-commit"
    | "create-pull-request"
    | "enable-pages"
    | "write-log"
    | "rollback";
  status: "planned" | "requires-oauth" | "skipped";
  detail: string;
};

export type DeploymentExecutionPreview = {
  id: string;
  plan: DeploymentPlan;
  diff: FileDiff[];
  operations: DeploymentOperation[];
  logs: Array<{ time: string; level: "info" | "warn" | "error"; message: string }>;
  requiresOAuth: boolean;
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

export function createDeploymentExecutionPreview(input: {
  plan: DeploymentPlan;
  diff: FileDiff[];
  authenticated: boolean;
}): DeploymentExecutionPreview {
  const requiresOAuth = !input.authenticated;
  const operations: DeploymentOperation[] = [
    operation(1, "check-auth", requiresOAuth ? "requires-oauth" : "planned", requiresOAuth ? "GitHub OAuth is required before repository writes." : "OAuth token is available."),
    operation(2, "ensure-repository", requiresOAuth ? "requires-oauth" : "planned", `Ensure ${input.plan.repository} exists and is public.`),
    operation(3, "read-current-files", requiresOAuth ? "requires-oauth" : "planned", "Read current file SHAs for conflict detection."),
    operation(4, "create-backup", input.plan.backupRequired ? (requiresOAuth ? "requires-oauth" : "planned") : "skipped", `Create backup label ${input.plan.rollbackLabel}.`),
    operation(5, "write-files", requiresOAuth ? "requires-oauth" : "planned", `Write ${input.plan.files.length} generated files.`),
    operation(6, "create-commit", requiresOAuth ? "requires-oauth" : "planned", input.plan.commitMessage),
    operation(7, "create-pull-request", input.plan.mode === "pull-request" ? (requiresOAuth ? "requires-oauth" : "planned") : "skipped", `Open PR against ${input.plan.branch}.`),
    operation(8, "write-log", "planned", "Persist deployment log and diff summary.")
  ];

  if (input.plan.target === "pages") {
    operations.splice(7, 0, operation(8, "enable-pages", requiresOAuth ? "requires-oauth" : "planned", "Enable GitHub Pages from the configured branch and root path."));
  }

  return {
    id: `${input.plan.target}-${Date.now().toString(36)}`,
    plan: input.plan,
    diff: input.diff,
    operations: operations.map((item, index) => ({ ...item, order: index + 1 })),
    logs: [
      { time: new Date().toISOString(), level: "info", message: "Deployment execution preview created." },
      { time: new Date().toISOString(), level: requiresOAuth ? "warn" : "info", message: requiresOAuth ? "OAuth is required for live GitHub writes." : "Ready for live GitHub write execution." }
    ],
    requiresOAuth
  };
}

export function createPagesEnablementPlan(input: { username: string; branch?: string; path?: string; authenticated: boolean }): DeploymentExecutionPreview {
  const plan: DeploymentPlan = {
    username: input.username,
    repository: `${input.username}.github.io`,
    target: "pages",
    mode: "direct-commit",
    branch: input.branch ?? "main",
    commitMessage: "chore: enable GitHub Pages",
    files: [],
    backupRequired: false,
    rollbackLabel: `pages-enable-${new Date().toISOString()}`
  };
  const preview = createDeploymentExecutionPreview({ plan, diff: [], authenticated: input.authenticated });
  preview.operations = [
    operation(1, "check-auth", input.authenticated ? "planned" : "requires-oauth", "Check GitHub OAuth token."),
    operation(2, "ensure-repository", input.authenticated ? "planned" : "requires-oauth", `Ensure ${plan.repository} exists.`),
    operation(3, "enable-pages", input.authenticated ? "planned" : "requires-oauth", `Enable Pages from ${plan.branch}:${input.path ?? "/"}.`),
    operation(4, "write-log", "planned", "Persist Pages enablement log.")
  ];
  return preview;
}

export function createRollbackPlan(input: { username: string; repository: string; rollbackLabel: string; authenticated: boolean }): DeploymentExecutionPreview {
  const plan: DeploymentPlan = {
    username: input.username,
    repository: input.repository,
    target: input.repository.endsWith(".github.io") ? "pages" : "readme",
    mode: "direct-commit",
    branch: "main",
    commitMessage: `revert: restore ${input.rollbackLabel}`,
    files: [],
    backupRequired: false,
    rollbackLabel: input.rollbackLabel
  };
  const preview = createDeploymentExecutionPreview({ plan, diff: [], authenticated: input.authenticated });
  preview.operations = [
    operation(1, "check-auth", input.authenticated ? "planned" : "requires-oauth", "Check GitHub OAuth token."),
    operation(2, "rollback", input.authenticated ? "planned" : "requires-oauth", `Restore files from backup ${input.rollbackLabel}.`),
    operation(3, "create-commit", input.authenticated ? "planned" : "requires-oauth", plan.commitMessage),
    operation(4, "write-log", "planned", "Persist rollback log.")
  ];
  return preview;
}

function hashContent(content: string): string {
  let hash = 0;
  for (let index = 0; index < content.length; index += 1) {
    hash = (hash * 31 + content.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function operation(order: number, action: DeploymentOperation["action"], status: DeploymentOperation["status"], detail: string): DeploymentOperation {
  return { order, action, status, detail };
}
