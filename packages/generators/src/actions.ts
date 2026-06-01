export type WorkflowModule =
  | "readme"
  | "pages-data"
  | "star-snapshot"
  | "fork-snapshot"
  | "contributions"
  | "blog-rss"
  | "achievements"
  | "year-in-review"
  | "card-cache"
  | "project-ranking"
  | "error-notification";

export type WorkflowConfig = {
  name: string;
  frequency: "daily" | "weekly" | "manual";
  cron?: string;
  modules: WorkflowModule[];
  commitMessage: string;
  targetBranch: string;
  skipEmptyUpdates: boolean;
  keepSnapshots: boolean;
};

export function generateWorkflow(config: WorkflowConfig): string {
  const triggers = ["  workflow_dispatch:"];
  if (config.frequency !== "manual") {
    triggers.unshift(`  schedule:\n    - cron: "${config.cron ?? defaultCron(config.frequency)}"`);
  }

  return `name: ${config.name}
on:
${triggers.join("\n")}
permissions:
  contents: write
  actions: read
jobs:
  update-profile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Run GitHub Profile Studio updater
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          GPS_MODULES: "${config.modules.join(",")}"
          GPS_KEEP_SNAPSHOTS: "${String(config.keepSnapshots)}"
          GPS_SKIP_EMPTY_UPDATES: "${String(config.skipEmptyUpdates)}"
        run: |
          echo "Updating modules: $GPS_MODULES"
          echo "Generated workflow hook for GitHub Profile Studio"
      - name: Commit generated changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add .
          if git diff --cached --quiet && [ "${String(config.skipEmptyUpdates)}" = "true" ]; then
            echo "No generated changes"
          else
            git commit -m "${escapeYaml(config.commitMessage)}"
            git push origin HEAD:${config.targetBranch}
          fi
`;
}

export function defaultWorkflowConfigs(): WorkflowConfig[] {
  return [
    {
      name: "Daily GitHub Profile Studio update",
      frequency: "daily",
      modules: ["readme", "pages-data", "star-snapshot", "fork-snapshot", "contributions", "achievements", "card-cache"],
      commitMessage: "chore: update profile studio daily data",
      targetBranch: "main",
      skipEmptyUpdates: true,
      keepSnapshots: true
    },
    {
      name: "Weekly GitHub Profile Studio review",
      frequency: "weekly",
      modules: ["blog-rss", "year-in-review", "project-ranking", "error-notification"],
      commitMessage: "chore: update profile studio weekly summary",
      targetBranch: "main",
      skipEmptyUpdates: true,
      keepSnapshots: true
    },
    {
      name: "Manual GitHub Profile Studio refresh",
      frequency: "manual",
      modules: ["readme", "pages-data", "achievements", "card-cache"],
      commitMessage: "chore: refresh profile studio output",
      targetBranch: "main",
      skipEmptyUpdates: false,
      keepSnapshots: true
    }
  ];
}

function defaultCron(frequency: WorkflowConfig["frequency"]): string {
  if (frequency === "weekly") return "0 6 * * 1";
  return "0 6 * * *";
}

function escapeYaml(value: string): string {
  return value.replaceAll('"', '\\"');
}

