export type ReadmeImportSourceType = "paste" | "upload" | "repository-url" | "oauth" | "username-repo" | "public-repo";

export type DetectedReadmeModuleType =
  | "title"
  | "introduction"
  | "badge"
  | "github-stats"
  | "streak"
  | "top-languages"
  | "trophy"
  | "activity-graph"
  | "visitor-counter"
  | "tech-icons"
  | "social-link"
  | "project-list"
  | "blog-posts"
  | "custom-html"
  | "image"
  | "table"
  | "comment"
  | "github-actions-marker"
  | "custom-markdown";

export type ThirdPartyCardProvider =
  | "github-readme-stats"
  | "github-readme-streak-stats"
  | "github-profile-trophy"
  | "activity-graph"
  | "shields"
  | "visitor-badge"
  | "komarev-profile-views"
  | "skill-icons"
  | "devicons"
  | "wakatime"
  | "spotify-now-playing"
  | "blog-post-workflow"
  | "typing-svg"
  | "metrics"
  | "snake-contribution-graph";

export type DetectedReadmeModule = {
  type: DetectedReadmeModuleType;
  title: string;
  raw: string;
  startLine: number;
  endLine: number;
  confidence: number;
};

export type DetectedThirdPartyCard = {
  provider: ThirdPartyCardProvider;
  url: string;
  params: Record<string, string>;
  markdown: string;
  convertible: boolean;
};

export type ImportSuggestion = {
  code: string;
  severity: "info" | "warning" | "error";
  message: string;
  acceptanceIds: string[];
};

export type ReadmeImportResult = {
  sourceType: ReadmeImportSourceType;
  modules: DetectedReadmeModule[];
  thirdPartyCards: DetectedThirdPartyCard[];
  suggestions: ImportSuggestion[];
  preservedCustomContent: string[];
  optimizedMarkdown: string;
};

const providerPatterns: Array<{ provider: ThirdPartyCardProvider; pattern: RegExp; convertible: boolean }> = [
  { provider: "github-readme-stats", pattern: /github-readme-stats\.vercel\.app\/api(?!\/top-langs)/i, convertible: true },
  { provider: "github-readme-stats", pattern: /github-readme-stats\.vercel\.app\/api\/pin/i, convertible: true },
  { provider: "github-readme-stats", pattern: /github-readme-stats\.vercel\.app\/api\/top-langs/i, convertible: true },
  { provider: "github-readme-streak-stats", pattern: /(streak-stats\.demolab\.com|github-readme-streak-stats\.herokuapp\.com)/i, convertible: true },
  { provider: "github-profile-trophy", pattern: /github-profile-trophy\.vercel\.app/i, convertible: true },
  { provider: "activity-graph", pattern: /(github-readme-activity-graph|activity-graph\.herokuapp)/i, convertible: true },
  { provider: "shields", pattern: /img\.shields\.io/i, convertible: true },
  { provider: "visitor-badge", pattern: /visitor-badge\.laobi\.icu/i, convertible: true },
  { provider: "komarev-profile-views", pattern: /komarev\.com\/ghpvc/i, convertible: true },
  { provider: "skill-icons", pattern: /skillicons\.dev/i, convertible: true },
  { provider: "devicons", pattern: /(devicon|cdn\.jsdelivr\.net\/gh\/devicons)/i, convertible: true },
  { provider: "wakatime", pattern: /wakatime\.com\/badge/i, convertible: false },
  { provider: "spotify-now-playing", pattern: /(spotify|novatorem)/i, convertible: false },
  { provider: "blog-post-workflow", pattern: /BLOG-POST-LIST/i, convertible: false },
  { provider: "typing-svg", pattern: /readme-typing-svg/i, convertible: true },
  { provider: "metrics", pattern: /metrics\..lecoq\.io/i, convertible: false },
  { provider: "snake-contribution-graph", pattern: /(snake\.svg|github-contribution-grid-snake)/i, convertible: false }
];

export function importReadmeMarkdown(markdown: string, sourceType: ReadmeImportSourceType = "paste"): ReadmeImportResult {
  const modules = detectReadmeModules(markdown);
  const thirdPartyCards = detectThirdPartyCards(markdown);
  const suggestions = buildImportSuggestions(markdown, modules, thirdPartyCards);
  const preservedCustomContent = modules
    .filter((module) => module.type === "custom-html" || module.type === "custom-markdown")
    .map((module) => module.raw);

  return {
    sourceType,
    modules,
    thirdPartyCards,
    suggestions,
    preservedCustomContent,
    optimizedMarkdown: buildOptimizedMarkdown(markdown, suggestions)
  };
}

export function detectThirdPartyCards(markdown: string): DetectedThirdPartyCard[] {
  const urls = extractMarkdownUrls(markdown);
  const cards: DetectedThirdPartyCard[] = [];

  for (const url of urls) {
    const provider = providerPatterns.find((item) => item.pattern.test(url));
    if (!provider) continue;
    cards.push({
      provider: provider.provider,
      url,
      params: parseUrlParams(url),
      markdown: findMarkdownForUrl(markdown, url),
      convertible: provider.convertible
    });
  }

  if (/BLOG-POST-LIST/i.test(markdown) && !cards.some((card) => card.provider === "blog-post-workflow")) {
    cards.push({
      provider: "blog-post-workflow",
      url: "github-actions:blog-post-workflow",
      params: {},
      markdown: "<!-- BLOG-POST-LIST -->",
      convertible: false
    });
  }

  return dedupeCards(cards);
}

export function detectReadmeModules(markdown: string): DetectedReadmeModule[] {
  const lines = markdown.split(/\r?\n/);
  const modules: DetectedReadmeModule[] = [];

  lines.forEach((line, index) => {
    const startLine = index + 1;
    if (/^#\s+/.test(line)) modules.push(module("title", "Title", line, startLine, startLine, 0.95));
    if (/^#{2,6}\s+/.test(line)) modules.push(module(classifyHeading(line), stripHeading(line), line, startLine, startLine, 0.7));
    if (/!\[[^\]]*]\([^)]+\)/.test(line)) modules.push(module("image", "Image", line, startLine, startLine, 0.75));
    if (/img\.shields\.io|badge/i.test(line)) modules.push(module("badge", "Badge", line, startLine, startLine, 0.8));
    if (/github-readme-stats\.vercel\.app\/api(?!\/top-langs)/i.test(line)) modules.push(module("github-stats", "GitHub Stats", line, startLine, startLine, 0.9));
    if (/top-langs/i.test(line)) modules.push(module("top-languages", "Top Languages", line, startLine, startLine, 0.9));
    if (/streak/i.test(line)) modules.push(module("streak", "Streak", line, startLine, startLine, 0.8));
    if (/github-profile-trophy/i.test(line)) modules.push(module("trophy", "Trophy", line, startLine, startLine, 0.9));
    if (/activity-graph/i.test(line)) modules.push(module("activity-graph", "Activity Graph", line, startLine, startLine, 0.9));
    if (/komarev\.com\/ghpvc|visitor/i.test(line)) modules.push(module("visitor-counter", "Visitor Counter", line, startLine, startLine, 0.8));
    if (/skillicons\.dev|devicon/i.test(line)) modules.push(module("tech-icons", "Tech Icons", line, startLine, startLine, 0.85));
    if (/\[.*]\((https?:\/\/(x\.com|twitter\.com|linkedin\.com|bilibili\.com|zhihu\.com|youtube\.com|discord\.com|t\.me|github\.com)[^)]+)\)/i.test(line)) {
      modules.push(module("social-link", "Social Link", line, startLine, startLine, 0.85));
    }
    if (/^\s*[-*]\s+\[?[\w .-]+]?[:：]/.test(line)) modules.push(module("project-list", "Project List", line, startLine, startLine, 0.55));
    if (/^\s*\|.*\|\s*$/.test(line)) modules.push(module("table", "Table", line, startLine, startLine, 0.8));
    if (/<!--[\s\S]*-->/.test(line)) modules.push(module("comment", "Comment", line, startLine, startLine, 0.8));
    if (/\.github\/workflows|workflow_dispatch|schedule:/i.test(line)) modules.push(module("github-actions-marker", "GitHub Actions Marker", line, startLine, startLine, 0.8));
    if (/<(div|p|img|picture|a|table|details|summary)[\s>]/i.test(line)) modules.push(module("custom-html", "Custom HTML", line, startLine, startLine, 0.7));
  });

  if (modules.length === 0 && markdown.trim()) {
    modules.push(module("custom-markdown", "Custom Markdown", markdown, 1, lines.length, 0.5));
  }

  return mergeAdjacentDuplicates(modules);
}

function buildImportSuggestions(
  markdown: string,
  modules: DetectedReadmeModule[],
  cards: DetectedThirdPartyCard[]
): ImportSuggestion[] {
  const suggestions: ImportSuggestion[] = [];
  const counts = modules.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] ?? 0) + 1;
    return acc;
  }, {});

  for (const [type, count] of Object.entries(counts)) {
    if (count > 3 && ["github-stats", "streak", "top-languages", "visitor-counter"].includes(type)) {
      suggestions.push({
        code: "DUPLICATE_MODULE",
        severity: "warning",
        message: `Detected repeated ${type} modules. Consider keeping one canonical module.`,
        acceptanceIds: ["08-009"]
      });
    }
  }

  if (/\]\(\s*\)/.test(markdown) || /!\[[^\]]*]\(\s*\)/.test(markdown)) {
    suggestions.push({
      code: "BROKEN_LINK",
      severity: "error",
      message: "Detected empty Markdown links or images.",
      acceptanceIds: ["08-009"]
    });
  }

  if (markdown.length > 90000) {
    suggestions.push({
      code: "README_LENGTH",
      severity: "warning",
      message: "README is very long; split dense content into Pages sections or collapsible details.",
      acceptanceIds: ["08-009"]
    });
  }

  if (cards.some((card) => card.convertible)) {
    suggestions.push({
      code: "CARD_CONVERSION_AVAILABLE",
      severity: "info",
      message: "One or more third-party cards can be converted to GitHub Profile Studio cards.",
      acceptanceIds: ["08-008", "08-009"]
    });
  }

  if (cards.length > 0) {
    suggestions.push({
      code: "THEME_UNIFICATION",
      severity: "info",
      message: "Detected card URLs can be normalized to a shared theme.",
      acceptanceIds: ["08-009", "09-005"]
    });
  }

  if (modules.some((item) => item.type === "custom-html")) {
    suggestions.push({
      code: "CUSTOM_HTML_PRESERVED",
      severity: "info",
      message: "Custom HTML blocks will be preserved as custom modules.",
      acceptanceIds: ["08-010"]
    });
  }

  return suggestions;
}

function buildOptimizedMarkdown(markdown: string, suggestions: ImportSuggestion[]): string {
  const banner = [
    "<!-- Generated optimization notes by GitHub Profile Studio -->",
    ...suggestions.map((item) => `<!-- ${item.severity.toUpperCase()}: ${item.message} -->`)
  ].join("\n");
  return `${banner}\n\n${markdown.trim()}\n`;
}

function classifyHeading(line: string): DetectedReadmeModuleType {
  const text = stripHeading(line).toLowerCase();
  if (/about|intro|profile|hello|hi|关于|介绍/.test(text)) return "introduction";
  if (/project|repo|作品|项目/.test(text)) return "project-list";
  if (/blog|article|post|博客|文章/.test(text)) return "blog-posts";
  if (/skill|tech|stack|language|技能|技术|语言/.test(text)) return "tech-icons";
  if (/contact|social|connect|联系|社交/.test(text)) return "social-link";
  return "custom-markdown";
}

function module(
  type: DetectedReadmeModuleType,
  title: string,
  raw: string,
  startLine: number,
  endLine: number,
  confidence: number
): DetectedReadmeModule {
  return { type, title, raw, startLine, endLine, confidence };
}

function stripHeading(line: string): string {
  return line.replace(/^#{1,6}\s+/, "").trim();
}

function extractMarkdownUrls(markdown: string): string[] {
  const urls = new Set<string>();
  for (const match of markdown.matchAll(/\[[^\]]*]\((https?:\/\/[^)\s]+)[^)]*\)/g)) urls.add(match[1]);
  for (const match of markdown.matchAll(/!\[[^\]]*]\((https?:\/\/[^)\s]+)[^)]*\)/g)) urls.add(match[1]);
  for (const match of markdown.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) urls.add(match[1]);
  return [...urls];
}

function parseUrlParams(url: string): Record<string, string> {
  try {
    return Object.fromEntries(new URL(url).searchParams.entries());
  } catch {
    return {};
  }
}

function findMarkdownForUrl(markdown: string, url: string): string {
  const line = markdown.split(/\r?\n/).find((item) => item.includes(url));
  return line ?? url;
}

function dedupeCards(cards: DetectedThirdPartyCard[]): DetectedThirdPartyCard[] {
  const seen = new Set<string>();
  return cards.filter((card) => {
    const key = `${card.provider}:${card.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeAdjacentDuplicates(modules: DetectedReadmeModule[]): DetectedReadmeModule[] {
  return modules.filter((item, index) => {
    const previous = modules[index - 1];
    return !(previous && previous.type === item.type && previous.startLine === item.startLine);
  });
}

