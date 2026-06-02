import type { LocalizedText } from "@gps/core";

export type ReadmeModuleDefinition = {
  id: string;
  label: LocalizedText;
  category: "identity" | "github-data" | "projects" | "community" | "content" | "custom";
  defaultEnabled: boolean;
  emptyDataBehavior: "hide" | "replace-with-copy" | "show";
  acceptanceIds: string[];
};

export const readmeModuleCatalog: ReadmeModuleDefinition[] = [
  { id: "intro", label: { en: "Personal introduction", zh: "个人介绍" }, category: "identity", defaultEnabled: true, emptyDataBehavior: "show", acceptanceIds: ["04-006"] },
  { id: "github-overview", label: { en: "GitHub overview", zh: "GitHub 总览" }, category: "github-data", defaultEnabled: true, emptyDataBehavior: "replace-with-copy", acceptanceIds: ["04-007"] },
  { id: "streak", label: { en: "GitHub streak", zh: "连续贡献" }, category: "github-data", defaultEnabled: true, emptyDataBehavior: "hide", acceptanceIds: ["04-008"] },
  { id: "contribution-calendar", label: { en: "Contribution calendar", zh: "贡献热力图" }, category: "github-data", defaultEnabled: true, emptyDataBehavior: "hide", acceptanceIds: ["04-009"] },
  { id: "languages", label: { en: "Language stats", zh: "语言统计" }, category: "github-data", defaultEnabled: true, emptyDataBehavior: "replace-with-copy", acceptanceIds: ["04-010"] },
  { id: "projects", label: { en: "Featured projects", zh: "热门仓库与项目" }, category: "projects", defaultEnabled: true, emptyDataBehavior: "replace-with-copy", acceptanceIds: ["04-011"] },
  { id: "star-growth", label: { en: "Star growth", zh: "Star 增长" }, category: "github-data", defaultEnabled: true, emptyDataBehavior: "hide", acceptanceIds: ["04-012"] },
  { id: "pr-issue", label: { en: "PR / Issue collaboration", zh: "PR / Issue 协作" }, category: "community", defaultEnabled: true, emptyDataBehavior: "hide", acceptanceIds: ["04-013"] },
  { id: "skills", label: { en: "Tech stack", zh: "技术栈" }, category: "identity", defaultEnabled: true, emptyDataBehavior: "show", acceptanceIds: ["04-014"] },
  { id: "achievements", label: { en: "Achievement wall", zh: "成就墙" }, category: "community", defaultEnabled: true, emptyDataBehavior: "replace-with-copy", acceptanceIds: ["04-015"] },
  { id: "contact", label: { en: "Social and contact", zh: "社交与联系" }, category: "identity", defaultEnabled: true, emptyDataBehavior: "show", acceptanceIds: ["04-016"] },
  { id: "blog", label: { en: "Blog posts", zh: "博客文章" }, category: "content", defaultEnabled: false, emptyDataBehavior: "hide", acceptanceIds: ["04-017"] },
  { id: "visitors", label: { en: "Visitor stats", zh: "访客统计" }, category: "github-data", defaultEnabled: false, emptyDataBehavior: "hide", acceptanceIds: ["04-018"] },
  { id: "typewriter", label: { en: "Typewriter animation", zh: "打字机动画" }, category: "identity", defaultEnabled: false, emptyDataBehavior: "show", acceptanceIds: ["N-README-018"] },
  { id: "custom", label: { en: "Custom Markdown", zh: "自定义模块" }, category: "custom", defaultEnabled: false, emptyDataBehavior: "show", acceptanceIds: ["04-019"] }
];

export function getDefaultReadmeModules() {
  return readmeModuleCatalog.filter((module) => module.defaultEnabled).map((module) => module.id);
}
