import type { StudioLocale } from "./language";

export type UiLocale = "en-US" | "zh-CN";

export type UiCopyEntry = {
  en: string;
  zh: string;
};

export const defaultUiLocale: UiLocale = "en-US";

export const uiCopyCatalog = {
  productTitle: { en: "GitHub Profile Studio", zh: "GitHub Profile Studio" },
  dashboard: { en: "Dashboard", zh: "工作台" },
  readme: { en: "README", zh: "README" },
  pages: { en: "Pages", zh: "主页" },
  cards: { en: "Cards", zh: "卡片" },
  achievements: { en: "Achievements", zh: "成就" },
  templates: { en: "Templates", zh: "模板" },
  settings: { en: "Settings", zh: "设置" },
  newUserAutomation: { en: "New-user automation", zh: "新用户自动化" },
  newUserDescription: {
    en: "English is the default output. Chinese and bilingual output stay available.",
    zh: "默认生成英文内容，也可以切换中文或中英双语。"
  },
  stepBasics: { en: "Basics", zh: "基础信息" },
  stepEducation: { en: "Education", zh: "教育背景" },
  stepSkills: { en: "Skills", zh: "技能" },
  stepProjects: { en: "Projects", zh: "项目" },
  stepPlan: { en: "Plan", zh: "计划" },
  stepPrivacy: { en: "Privacy", zh: "隐私" },
  stepPreview: { en: "Preview", zh: "预览" },
  saveDraft: { en: "Save draft", zh: "保存草稿" },
  draftNotSaved: { en: "Draft not saved", zh: "草稿未保存" },
  saving: { en: "Saving...", zh: "保存中..." },
  saveFailed: { en: "Save failed", zh: "保存失败" },
  savedAt: { en: "Saved at", zh: "已保存于" },
  copy: { en: "Copy", zh: "复制" },
  download: { en: "Download", zh: "下载" },
  copied: { en: "Markdown copied", zh: "Markdown 已复制" },
  downloaded: { en: "README downloaded", zh: "README 已下载" },
  previous: { en: "Previous", zh: "上一步" },
  next: { en: "Next", zh: "下一步" },
  outputLanguage: { en: "Output language", zh: "输出语言" },
  privacyControls: { en: "Privacy controls", zh: "隐私控制" },
  oauthLogin: { en: "GitHub OAuth login", zh: "GitHub OAuth 登录" },
  logout: { en: "Log out", zh: "退出登录" },
  permissions: { en: "Permissions", zh: "权限" },
  oneClickSubmit: { en: "One-click submit", zh: "一键提交" },
  deployReadme: { en: "Submit README", zh: "提交 README" },
  deployPages: { en: "Submit Pages", zh: "提交 Pages" },
  diffPreview: { en: "Diff preview", zh: "差异预览" },
  rollback: { en: "Rollback", zh: "回滚" },
  noDataFallback: { en: "No-data fallback", zh: "空数据替代" }
} satisfies Record<string, UiCopyEntry>;

export type UiCopyKey = keyof typeof uiCopyCatalog;
export type UiCopy = Record<UiCopyKey, string>;

export const uiCopyAcceptanceIds = ["13-001"] as const;

export function detectUiLocale(input?: string | readonly string[] | null): UiLocale {
  const values = Array.isArray(input) ? input : input ? [input] : [];
  const languageTags = values.flatMap((value) => value.split(",")).map((value) => value.trim().toLowerCase());
  return languageTags.some((value) => value.startsWith("zh")) ? "zh-CN" : defaultUiLocale;
}

export function toUiLocale(locale: StudioLocale | UiLocale): UiLocale {
  return locale === "zh-CN" ? "zh-CN" : defaultUiLocale;
}

export function getUiCopy(locale: UiLocale): UiCopy {
  return Object.fromEntries(
    Object.entries(uiCopyCatalog).map(([key, value]) => [key, locale === "zh-CN" ? value.zh : value.en])
  ) as UiCopy;
}

export function getUiLabel(key: UiCopyKey, locale: UiLocale): string {
  return uiCopyCatalog[key][locale === "zh-CN" ? "zh" : "en"];
}
