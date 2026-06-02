import { describe, expect, it } from "vitest";
import { buildSecurityHeaders, sanitizeHtml, sanitizeMarkdown, validateExternalAsset } from "./security";

describe("security utilities", () => {
  it("sanitizes markdown and HTML injection vectors", () => {
    const markdown = sanitizeMarkdown("[x](javascript:alert(1)) <script>alert(1)</script>");
    const html = sanitizeHtml('<img src="x" onerror="alert(1)"><iframe src="https://evil.example"></iframe>');

    expect(markdown.validation.acceptanceIds).toContain("13-011");
    expect(markdown.output).not.toContain("<script");
    expect(markdown.output).not.toContain("javascript:");
    expect(html.output).not.toContain("onerror");
    expect(html.output).not.toContain("<iframe");
  });

  it("validates external assets and emits security headers", () => {
    expect(validateExternalAsset("https://example.com/image.png").safe).toBe(true);
    expect(validateExternalAsset("javascript:alert(1)").safe).toBe(false);
    expect(buildSecurityHeaders()["Content-Security-Policy"]).toContain("api.github.com");
  });
});
