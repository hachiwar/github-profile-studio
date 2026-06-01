import type { ProfileStudioConfig } from "@gps/core";
import { runPrivacyCheck } from "@gps/core";

export type ReadmeCompatibilityIssue = {
  code: string;
  severity: "info" | "warning" | "error";
  message: string;
  acceptanceIds: string[];
};

export function checkReadmeCompatibility(markdown: string, config: ProfileStudioConfig): ReadmeCompatibilityIssue[] {
  const issues: ReadmeCompatibilityIssue[] = [];

  if (markdown.length > 120000) {
    issues.push({
      code: "README_TOO_LONG",
      severity: "warning",
      message: "README is very long and may be hard to scan on GitHub.",
      acceptanceIds: ["08-009"]
    });
  }

  if (/<script[\s>]/i.test(markdown)) {
    issues.push({
      code: "SCRIPT_TAG_BLOCKED",
      severity: "error",
      message: "GitHub README does not allow executable script tags.",
      acceptanceIds: ["13-011"]
    });
  }

  if (/javascript:/i.test(markdown)) {
    issues.push({
      code: "JAVASCRIPT_URL_BLOCKED",
      severity: "error",
      message: "javascript: URLs are blocked to prevent Markdown injection.",
      acceptanceIds: ["13-011"]
    });
  }

  const missingImages = markdown.match(/!\[[^\]]*]\(\s*\)/g) ?? [];
  if (missingImages.length > 0) {
    issues.push({
      code: "EMPTY_IMAGE_URL",
      severity: "warning",
      message: "One or more image tags have empty URLs.",
      acceptanceIds: ["08-009"]
    });
  }

  for (const warning of runPrivacyCheck(config)) {
    issues.push({
      code: `PRIVACY_${warning.field.toUpperCase()}`,
      severity: warning.severity === "critical" ? "error" : "warning",
      message: warning.message,
      acceptanceIds: ["N-PRIV-013"]
    });
  }

  return issues;
}

