export type SecurityValidation = {
  safe: boolean;
  removed: string[];
  warnings: string[];
  acceptanceIds: string[];
};

const dangerousPatterns = [
  { name: "script-tag", pattern: /<script\b[^>]*>[\s\S]*?<\/script>/gi },
  { name: "event-handler", pattern: /\son[a-z]+\s*=\s*(['"]).*?\1/gi },
  { name: "javascript-url", pattern: /javascript:/gi },
  { name: "data-html", pattern: /data:text\/html/gi },
  { name: "iframe", pattern: /<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi }
];

export function sanitizeMarkdown(input: string): { output: string; validation: SecurityValidation } {
  return sanitizeText(input, ["markdown-injection"]);
}

export function sanitizeHtml(input: string): { output: string; validation: SecurityValidation } {
  return sanitizeText(input, ["html-injection"]);
}

export function validateExternalAsset(url: string): SecurityValidation {
  const warnings: string[] = [];
  try {
    const parsed = new URL(url);
    if (!["https:", "http:"].includes(parsed.protocol)) warnings.push("Only http/https assets are allowed.");
    if (parsed.protocol === "http:") warnings.push("Use https assets for public README and Pages output.");
  } catch {
    warnings.push("Asset URL is invalid.");
  }
  return {
    safe: warnings.length === 0,
    removed: [],
    warnings,
    acceptanceIds: ["13-011"]
  };
}

export function buildSecurityHeaders() {
  return {
    "Content-Security-Policy": "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https://api.github.com",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  };
}

function sanitizeText(input: string, warnings: string[]) {
  let output = input;
  const removed: string[] = [];
  for (const rule of dangerousPatterns) {
    if (rule.pattern.test(output)) {
      removed.push(rule.name);
      output = output.replace(rule.pattern, "");
    }
  }
  const validation = {
    safe: removed.length === 0,
    removed,
    warnings,
    acceptanceIds: ["13-011"]
  };
  return { output, validation };
}
