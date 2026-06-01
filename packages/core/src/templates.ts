import type { GenerationMode } from "./domain";
import type { LocalizedText } from "./language";

export type TemplateDefinition = {
  key: string;
  type: "readme" | "pages" | "card" | "achievement" | "portfolio" | "resume" | "dashboard" | "social-card" | "year-in-review" | "custom";
  name: LocalizedText;
  description: LocalizedText;
  recommendedModes: GenerationMode[];
  acceptanceIds: string[];
};

export type ThemeDefinition = {
  key: string;
  name: LocalizedText;
  category: string;
  tokens: {
    primary: string;
    accent: string;
    background: string;
    foreground: string;
    border: string;
    fontFamily: string;
    radius: string;
    shadow: string;
    density: "compact" | "comfortable" | "spacious";
    animation: "none" | "subtle" | "expressive";
  };
};

export const generationModes = [
  { key: "new-user", label: { en: "New-user automation", zh: "新用户自动化模式" } },
  { key: "data-enhanced", label: { en: "Data-enhanced", zh: "数据增强模式" } },
  { key: "hybrid", label: { en: "Hybrid", zh: "混合模式" } },
  { key: "manual", label: { en: "Manual selection", zh: "手动选择模式" } }
] as const;

const readmeNames = [
  ["student-developer", "Student Developer", "学生开发者", "A friendly profile for students starting their software journey."],
  ["computer-science-student", "Computer Science Student", "计算机专业学生", "Education, courses, projects, and learning plans."],
  ["career-switcher", "Career Switcher", "非科班转码", "A growth-oriented profile for learners changing careers."],
  ["frontend-learner", "Frontend Learner", "前端学习者", "Highlights UI, web skills, and projects."],
  ["backend-learner", "Backend Learner", "后端学习者", "Highlights APIs, services, data, and systems."],
  ["fullstack-learner", "Full-stack Learner", "全栈学习者", "Combines frontend, backend, database, and deployment skills."],
  ["ai-data-learner", "AI / Data Science Learner", "AI / 数据科学学习者", "Focuses on ML, data, notebooks, and experiments."],
  ["algorithm-competition", "Algorithm Competition", "算法竞赛", "Shows competitive programming goals and progress."],
  ["job-seeker", "Job Seeker", "求职准备", "Clear skills, projects, resume, and contact actions."],
  ["internship", "Internship Application", "实习申请", "A concise profile for internship preparation."],
  ["course-projects", "Course Project Showcase", "课程项目展示", "Organizes course work and project plans."],
  ["open-source-newcomer", "Open Source Newcomer", "开源新人", "Shows contribution goals without empty PR or issue stats."],
  ["minimal-intro", "Minimal Personal Intro", "极简个人介绍", "A compact and readable profile."],
  ["technical-resume", "Technical Resume", "技术简历", "Resume-like README sections for recruiters."],
  ["bilingual", "Bilingual README", "中英文双语", "English and Chinese profile content together."]
];

export const builtinReadmeTemplates: TemplateDefinition[] = readmeNames.map(([key, en, zh, description]) => ({
  key,
  type: "readme",
  name: { en, zh },
  description: { en: description, zh: `${zh} README 模板。` },
  recommendedModes: ["new-user", "hybrid"],
  acceptanceIds: ["04-001", "N-RT-001", "N-README-001"]
}));

const pageNames = [
  ["student-portfolio", "Student Portfolio", "学生作品集"],
  ["job-resume", "Job Resume", "求职简历"],
  ["learning-growth", "Learning Growth Home", "学习成长主页"],
  ["course-project-showcase", "Course Project Showcase", "课程项目展示"],
  ["ai-learner", "AI Learner", "AI 学习者"],
  ["frontend-developer", "Frontend Developer", "前端开发者"],
  ["backend-developer", "Backend Developer", "后端开发者"],
  ["fullstack-developer", "Full-stack Developer", "全栈开发者"],
  ["minimal-card", "Minimal Card", "极简名片"],
  ["personal-brand", "Personal Brand", "个人品牌主页"],
  ["bilingual-site", "Bilingual Site", "中英文双语主页"],
  ["bento-student", "Bento Grid Student", "Bento Grid 学生主页"],
  ["timeline-growth", "Timeline Growth", "时间线成长主页"],
  ["skill-map", "Skill Map", "技能地图主页"],
  ["open-source-newcomer-site", "Open Source Newcomer", "开源新人主页"]
];

export const builtinPageTemplates: TemplateDefinition[] = pageNames.map(([key, en, zh]) => ({
  key,
  type: "pages",
  name: { en, zh },
  description: { en: `${en} GitHub Pages template with responsive layout and SEO.`, zh: `${zh} GitHub Pages 模板。` },
  recommendedModes: ["new-user", "data-enhanced", "hybrid"],
  acceptanceIds: ["05-001", "N-PT-001", "N-PAGE-001"]
}));

export const builtinThemePresets: ThemeDefinition[] = [
  ["github-native", "GitHub Native", "GitHub 原生风", "#0969da", "#1f883d", "#ffffff", "#24292f"],
  ["minimal-light", "Minimal Light", "极简浅色", "#111827", "#2563eb", "#ffffff", "#111827"],
  ["minimal-dark", "Minimal Dark", "极简深色", "#60a5fa", "#34d399", "#0f172a", "#e5e7eb"],
  ["cyber-neon", "Cyber Neon", "赛博霓虹", "#22d3ee", "#f472b6", "#050816", "#ecfeff"],
  ["terminal-green", "Terminal Green", "终端绿色", "#22c55e", "#84cc16", "#020617", "#dcfce7"],
  ["glassmorphism", "Glassmorphism", "玻璃拟态", "#6366f1", "#06b6d4", "#f8fafc", "#0f172a"],
  ["bento-grid", "Bento Grid", "Bento Grid", "#0f172a", "#f97316", "#f8fafc", "#0f172a"],
  ["academic", "Academic", "学术简历风", "#1d4ed8", "#7c3aed", "#ffffff", "#111827"],
  ["developer-portfolio", "Developer Portfolio", "开发者作品集", "#2563eb", "#10b981", "#f9fafb", "#111827"],
  ["open-source-hero", "Open Source Hero", "开源大佬风", "#0ea5e9", "#22c55e", "#f8fafc", "#0f172a"],
  ["pixel-art", "Pixel Art", "二次元像素风", "#e11d48", "#facc15", "#fff7ed", "#1f2937"],
  ["apple-clean", "Apple Clean", "Apple 极简", "#111827", "#64748b", "#ffffff", "#111827"],
  ["dashboard-pro", "Dashboard Pro", "数据看板", "#2563eb", "#14b8a6", "#f8fafc", "#0f172a"],
  ["ocean-blue", "Ocean Blue", "海洋蓝", "#0284c7", "#06b6d4", "#f0f9ff", "#0c4a6e"],
  ["sunset-gradient", "Sunset Gradient", "日落渐变", "#f97316", "#e11d48", "#fff7ed", "#111827"]
].map(([key, en, zh, primary, accent, background, foreground]) => ({
  key,
  name: { en, zh },
  category: "built-in",
  tokens: {
    primary,
    accent,
    background,
    foreground,
    border: "#d0d7de",
    fontFamily: "Inter, ui-sans-serif, system-ui",
    radius: "8px",
    shadow: "0 1px 2px rgb(15 23 42 / 0.08)",
    density: "comfortable",
    animation: "subtle"
  }
}));

