import type { PageSiteBundle } from "@gps/core";

export type PagesCompatibilityIssue = {
  code: string;
  severity: "info" | "warning" | "error";
  message: string;
  acceptanceIds: string[];
};

const requiredFiles = [
  "index.html",
  "style.css",
  "script.js",
  "data/github.json",
  "README.md",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  ".github/workflows/update-pages.yml"
];

export function checkPagesCompatibility(bundle: PageSiteBundle): PagesCompatibilityIssue[] {
  const issues: PagesCompatibilityIssue[] = [];

  for (const file of requiredFiles) {
    if (!bundle.files[file]) {
      issues.push({
        code: "MISSING_FILE",
        severity: "error",
        message: `${file} is required for a complete GitHub Pages export.`,
        acceptanceIds: ["05-009", "N-POUT-001"]
      });
    }
  }

  const html = bundle.files["index.html"] ?? "";
  if (!/<meta name="description"/.test(html)) {
    issues.push({ code: "MISSING_SEO_DESCRIPTION", severity: "warning", message: "index.html should include a meta description.", acceptanceIds: ["N-PVIS-009"] });
  }
  if (!/<meta property="og:title"/.test(html)) {
    issues.push({ code: "MISSING_OG_TITLE", severity: "warning", message: "index.html should include Open Graph metadata.", acceptanceIds: ["N-PVIS-010"] });
  }
  if (!/rel="icon"/.test(html)) {
    issues.push({ code: "MISSING_FAVICON", severity: "warning", message: "index.html should include a favicon.", acceptanceIds: ["N-PVIS-011"] });
  }
  if (/<script[\s>][\s\S]*<\/script>/i.test(html.replace(/<script src="\.\/script\.js"><\/script>/, ""))) {
    issues.push({ code: "INLINE_SCRIPT", severity: "warning", message: "Inline scripts should be avoided in generated GitHub Pages output.", acceptanceIds: ["13-011"] });
  }

  return issues;
}

