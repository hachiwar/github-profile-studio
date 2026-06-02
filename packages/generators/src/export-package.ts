import type { PageSiteBundle, ProfileStudioConfig } from "@gps/core";
import { localize } from "@gps/core";
import { defaultWorkflowConfigs, generateWorkflow } from "./actions";
import { generatePagesSite } from "./pages";
import { generateReadme } from "./readme";

export type ExportTarget = "readme" | "pages";

export type ExportFile = {
  path: string;
  content: string;
  mimeType: string;
  size: number;
  checksum: string;
};

export type ExportPackage = {
  name: string;
  target: ExportTarget;
  locale: ProfileStudioConfig["locale"];
  username: string;
  generatedAt: string;
  repository: {
    owner: string;
    name: string;
    defaultBranch: string;
  };
  files: ExportFile[];
  manifest: {
    schemaVersion: "1.0";
    fileCount: number;
    totalBytes: number;
    entrypoints: string[];
    acceptanceIds: string[];
    warnings: string[];
  };
  instructions: string;
};

export function buildReadmeExportPackage(config: ProfileStudioConfig): ExportPackage {
  const generated = generateReadme(config);
  const workflow = defaultWorkflowConfigs().find((item) => item.modules.includes("readme")) ?? defaultWorkflowConfigs()[0];
  const files = toExportFiles({
    "README.md": generated.markdown,
    ".github/workflows/profile-readme-update.yml": generateWorkflow(workflow),
    "assets/profile-studio-metadata.json": renderReadmeMetadata(config),
    "profile-studio.config.json": serializeConfig(config),
    "profile-studio.cards.md": renderCardLinks(config),
    "DEPLOYMENT.md": renderReadmeDeploymentGuide(config)
  });

  return buildPackage({
    target: "readme",
    name: `${config.targetUsername}-profile-readme`,
    config,
    repositoryName: config.targetUsername,
    files,
    warnings: generated.warnings,
    acceptanceIds: ["04-020", "04-021", "04-022", "11-001", "13-001", "N-ROUT-001"]
  });
}

export function buildPagesExportPackage(config: ProfileStudioConfig): ExportPackage {
  const bundle = generatePagesSite(config);
  const files = toExportFiles({
    ...bundle.files,
    "profile-studio.config.json": serializeConfig(config),
    "DEPLOYMENT.md": renderPagesDeploymentGuide(config, bundle)
  });

  return buildPackage({
    target: "pages",
    name: `${config.targetUsername}.github.io`,
    config,
    repositoryName: `${config.targetUsername}.github.io`,
    files,
    warnings: bundle.warnings,
    acceptanceIds: ["05-009", "05-010", "05-011", "05-012", "05-013", "N-POUT-001", "N-POUT-010"]
  });
}

function buildPackage(input: {
  target: ExportTarget;
  name: string;
  config: ProfileStudioConfig;
  repositoryName: string;
  files: ExportFile[];
  warnings: string[];
  acceptanceIds: string[];
}): ExportPackage {
  const manifestWithoutFile = {
    schemaVersion: "1.0" as const,
    fileCount: input.files.length + 1,
    totalBytes: input.files.reduce((sum, file) => sum + file.size, 0),
    entrypoints: input.target === "readme" ? ["README.md"] : ["index.html", "style.css", "script.js"],
    acceptanceIds: input.acceptanceIds,
    warnings: input.warnings
  };
  const packageBase = {
    name: input.name,
    target: input.target,
    locale: input.config.locale,
    username: input.config.targetUsername,
    generatedAt: new Date().toISOString(),
    repository: {
      owner: input.config.targetUsername,
      name: input.repositoryName,
      defaultBranch: "main"
    },
    manifest: manifestWithoutFile,
    instructions: input.target === "readme" ? renderReadmeDeploymentGuide(input.config) : renderPagesDeploymentGuide(input.config)
  };
  const manifestFile = toExportFile("profile-studio.manifest.json", JSON.stringify(packageBase, null, 2));
  const files = [...input.files, manifestFile];

  return {
    ...packageBase,
    files,
    manifest: {
      ...manifestWithoutFile,
      totalBytes: files.reduce((sum, file) => sum + file.size, 0)
    }
  };
}

function toExportFiles(files: Record<string, string>): ExportFile[] {
  return Object.entries(files).map(([path, content]) => toExportFile(path, content));
}

function toExportFile(path: string, content: string): ExportFile {
  return {
    path,
    content,
    mimeType: mimeTypeForPath(path),
    size: new TextEncoder().encode(content).length,
    checksum: stableHash(content)
  };
}

function serializeConfig(config: ProfileStudioConfig): string {
  return JSON.stringify(
    {
      locale: config.locale,
      mode: config.mode,
      targetUsername: config.targetUsername,
      themeKey: config.themeKey,
      readmeTemplateKey: config.readmeTemplateKey,
      pageTemplateKey: config.pageTemplateKey,
      enabledReadmeModules: config.enabledReadmeModules,
      enabledPageSections: config.enabledPageSections,
      privacy: config.privacy,
      profile: config.profile,
      education: config.education,
      skills: config.skills,
      learningPlan: config.learningPlan,
      manualProjects: config.manualProjects,
      socialLinks: config.socialLinks
    },
    null,
    2
  );
}

function renderCardLinks(config: ProfileStudioConfig): string {
  const encodedUser = encodeURIComponent(config.targetUsername);
  const locale = encodeURIComponent(config.locale);
  const cards = [
    ["Profile overview", "profile"],
    ["GitHub stats", "stats"],
    ["Streak", "streak"],
    ["Top languages", "languages"],
    ["Achievements", "achievements"]
  ];

  return `# Dynamic Card Links

${cards.map(([label, type]) => `- ${label}: \`/api/cards/${type}?user=${encodedUser}&locale=${locale}&theme=${config.themeKey}\``).join("\n")}
`;
}

function renderReadmeMetadata(config: ProfileStudioConfig): string {
  return JSON.stringify(
    {
      generatedBy: "GitHub Profile Studio",
      generatedAt: new Date().toISOString(),
      target: "readme",
      username: config.targetUsername,
      locale: config.locale,
      themeKey: config.themeKey,
      readmeTemplateKey: config.readmeTemplateKey,
      cardApiBasePath: "/api/cards",
      enabledModules: config.enabledReadmeModules
    },
    null,
    2
  );
}

function renderReadmeDeploymentGuide(config: ProfileStudioConfig): string {
  return `# GitHub Profile README Deployment

Repository: \`${config.targetUsername}\`

1. Create a public repository named exactly \`${config.targetUsername}\`.
2. Copy or commit \`README.md\` to the repository root.
3. Keep \`.github/workflows/profile-readme-update.yml\` if you want scheduled refreshes.
4. Review \`profile-studio.config.json\` before publishing if you changed privacy settings.

${localize({ en: "Generated by GitHub Profile Studio.", zh: "Generated by GitHub Profile Studio." }, config.locale)}
`;
}

function renderPagesDeploymentGuide(config: ProfileStudioConfig, bundle?: PageSiteBundle): string {
  const warnings = bundle?.warnings.length ? `\nWarnings:\n${bundle.warnings.map((warning) => `- ${warning}`).join("\n")}\n` : "";
  return `# GitHub Pages Deployment

Repository: \`${config.targetUsername}.github.io\`

1. Create a public repository named \`${config.targetUsername}.github.io\`.
2. Commit all files in this package to the repository root.
3. Enable GitHub Pages from the repository settings with branch \`main\` and path \`/\`.
4. Open \`https://${config.targetUsername}.github.io/\` after the Pages deployment completes.
5. Keep \`.github/workflows/update-pages.yml\` if you want scheduled data refreshes.
6. Optional custom domain: add a \`CNAME\` file containing your domain, then configure the same domain in GitHub Pages settings after DNS points to GitHub Pages.
${warnings}
Generated by GitHub Profile Studio.
`;
}

function mimeTypeForPath(path: string): string {
  if (path.endsWith(".md")) return "text/markdown; charset=utf-8";
  if (path.endsWith(".html")) return "text/html; charset=utf-8";
  if (path.endsWith(".css")) return "text/css; charset=utf-8";
  if (path.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (path.endsWith(".json")) return "application/json; charset=utf-8";
  if (path.endsWith(".xml")) return "application/xml; charset=utf-8";
  if (path.endsWith(".txt")) return "text/plain; charset=utf-8";
  if (path.endsWith(".yml") || path.endsWith(".yaml")) return "application/yaml; charset=utf-8";
  return "application/octet-stream";
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
