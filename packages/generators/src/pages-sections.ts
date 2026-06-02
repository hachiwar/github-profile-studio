import type { LocalizedText } from "@gps/core";

export type PageSectionDefinition = {
  id: string;
  label: LocalizedText;
  requiredForNewUser: boolean;
  emptyDataBehavior: "hide" | "replace-with-copy" | "show";
  acceptanceIds: string[];
};

export const pageSectionCatalog: PageSectionDefinition[] = [
  { id: "hero", label: { en: "Hero", zh: "首屏" }, requiredForNewUser: true, emptyDataBehavior: "show", acceptanceIds: ["05-002", "N-PAGE-002"] },
  { id: "about", label: { en: "About", zh: "个人简介" }, requiredForNewUser: true, emptyDataBehavior: "show", acceptanceIds: ["05-002", "N-PAGE-003"] },
  { id: "education", label: { en: "Education", zh: "教育背景" }, requiredForNewUser: true, emptyDataBehavior: "hide", acceptanceIds: ["N-PAGE-004"] },
  { id: "skills", label: { en: "Skills", zh: "技能栈" }, requiredForNewUser: true, emptyDataBehavior: "show", acceptanceIds: ["N-PAGE-005", "N-PAGE-006"] },
  { id: "learning-directions", label: { en: "Learning directions", zh: "学习方向" }, requiredForNewUser: true, emptyDataBehavior: "replace-with-copy", acceptanceIds: ["N-PAGE-007"] },
  { id: "learning-plan", label: { en: "Learning plan", zh: "学习计划" }, requiredForNewUser: true, emptyDataBehavior: "replace-with-copy", acceptanceIds: ["N-PAGE-008"] },
  { id: "projects", label: { en: "Projects", zh: "项目作品" }, requiredForNewUser: true, emptyDataBehavior: "replace-with-copy", acceptanceIds: ["N-PAGE-009"] },
  { id: "timeline", label: { en: "Timeline", zh: "时间线" }, requiredForNewUser: true, emptyDataBehavior: "replace-with-copy", acceptanceIds: ["N-PAGE-010"] },
  { id: "growth-roadmap", label: { en: "Growth roadmap", zh: "成长路线" }, requiredForNewUser: true, emptyDataBehavior: "replace-with-copy", acceptanceIds: ["N-PAGE-011"] },
  { id: "github", label: { en: "GitHub overview", zh: "GitHub 数据概览" }, requiredForNewUser: false, emptyDataBehavior: "hide", acceptanceIds: ["N-PAGE-012"] },
  { id: "future-goals", label: { en: "Future goals", zh: "未来目标" }, requiredForNewUser: true, emptyDataBehavior: "replace-with-copy", acceptanceIds: ["N-PAGE-013"] },
  { id: "achievements", label: { en: "Achievement wall", zh: "成就墙" }, requiredForNewUser: false, emptyDataBehavior: "replace-with-copy", acceptanceIds: ["04-015", "05-002"] },
  { id: "contact", label: { en: "Contact", zh: "联系方式" }, requiredForNewUser: true, emptyDataBehavior: "show", acceptanceIds: ["N-PAGE-014"] },
  { id: "resume", label: { en: "Resume", zh: "简历入口" }, requiredForNewUser: false, emptyDataBehavior: "hide", acceptanceIds: ["N-PAGE-015"] },
  { id: "blog", label: { en: "Blog", zh: "博客入口" }, requiredForNewUser: false, emptyDataBehavior: "hide", acceptanceIds: ["N-PAGE-016"] }
];
