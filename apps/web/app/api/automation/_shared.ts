import type { NextRequest } from "next/server";
import { demoProfileConfig, type GitHubDataset, type ProfileStudioConfig, type StudioLocale } from "@gps/core";
import { defaultWorkflowConfigs, type WorkflowConfig, type WorkflowModule } from "@gps/generators";

const moduleSet = new Set<WorkflowModule>([
  "readme",
  "pages-data",
  "star-snapshot",
  "fork-snapshot",
  "contributions",
  "blog-rss",
  "achievements",
  "year-in-review",
  "card-cache",
  "project-ranking",
  "error-notification"
]);

export type AutomationRequestConfig = {
  config: ProfileStudioConfig;
  dataset?: GitHubDataset;
  previousDataset?: GitHubDataset;
  modules?: WorkflowModule[];
  workflow: WorkflowConfig;
  generatedAt?: string;
};

export async function resolveAutomationRequest(request: NextRequest): Promise<AutomationRequestConfig> {
  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const username = stringValue(body.username) ?? request.nextUrl.searchParams.get("username") ?? "new-developer";
  const locale = parseLocale(stringValue(body.locale) ?? request.nextUrl.searchParams.get("locale"));
  const config = isObject(body.config) ? (body.config as ProfileStudioConfig) : demoProfileConfig(username, locale);
  const dataset = isObject(body.dataset) ? (body.dataset as GitHubDataset) : config.github;
  const previousDataset = isObject(body.previousDataset) ? (body.previousDataset as GitHubDataset) : undefined;
  const workflow = resolveWorkflow(body, request);
  const modules = parseModules(body.modules) ?? parseModules(request.nextUrl.searchParams.get("modules")) ?? workflow.modules;
  const generatedAt = stringValue(body.generatedAt) ?? request.nextUrl.searchParams.get("generatedAt") ?? undefined;

  return { config, dataset, previousDataset, modules, workflow: { ...workflow, modules }, generatedAt };
}

function resolveWorkflow(body: Record<string, unknown>, request: NextRequest): WorkflowConfig {
  if (isObject(body.workflow)) return body.workflow as WorkflowConfig;
  const frequency = stringValue(body.frequency) ?? request.nextUrl.searchParams.get("frequency");
  const workflows = defaultWorkflowConfigs();
  const selected = workflows.find((item) => item.frequency === frequency) ?? workflows[0];
  return {
    ...selected,
    cron: stringValue(body.cron) ?? request.nextUrl.searchParams.get("cron") ?? selected.cron,
    commitMessage: stringValue(body.commitMessage) ?? request.nextUrl.searchParams.get("commitMessage") ?? selected.commitMessage,
    targetBranch: stringValue(body.targetBranch) ?? request.nextUrl.searchParams.get("targetBranch") ?? selected.targetBranch
  };
}

function parseModules(value: unknown): WorkflowModule[] | undefined {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  const modules = values.map((item) => String(item).trim()).filter((item): item is WorkflowModule => moduleSet.has(item as WorkflowModule));
  return modules.length > 0 ? modules : undefined;
}

function parseLocale(value?: string | null): StudioLocale {
  if (value === "zh-CN" || value === "bilingual") return value;
  return "en-US";
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
