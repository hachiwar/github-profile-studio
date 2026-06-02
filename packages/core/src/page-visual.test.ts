import { describe, expect, it } from "vitest";
import { defaultNewUserFormDraft } from "./new-user-form";
import { buildPageVisualExport, defaultPageVisualConfig, pageVisualConfigSchema } from "./page-visual";

describe("page visual configuration", () => {
  it("builds configurable visual settings for Pages output", () => {
    const draft = defaultNewUserFormDraft("alex", "en-US");
    const config = defaultPageVisualConfig(draft);
    const parsed = pageVisualConfigSchema.parse(config);

    expect(parsed.style).toBe("student-portfolio");
    expect(parsed.primaryColor).toBe("#0969da");
    expect(parsed.fontFamily).toContain("Inter");
    expect(parsed.heroLayout).toBe("centered");
    expect(parsed.cardStyle).toBe("bordered");
    expect(parsed.skillIconStyle).toBe("progress");
    expect(parsed.projectCardStyle).toBe("case-study");
  });

  it("exports SEO, Open Graph, favicon, and static resource metadata", () => {
    const draft = defaultNewUserFormDraft("alex", "en-US");
    const output = buildPageVisualExport(draft, { primaryColor: "#111827", accentColor: "#10b981" });

    expect(output.acceptanceIds).toEqual(expect.arrayContaining([
      "N-PVIS-001",
      "N-PVIS-002",
      "N-PVIS-003",
      "N-PVIS-004",
      "N-PVIS-005",
      "N-PVIS-006",
      "N-PVIS-007",
      "N-PVIS-008",
      "N-PVIS-009",
      "N-PVIS-010",
      "N-PVIS-011",
      "N-POUT-007"
    ]));
    expect(output.seoTags.join("\n")).toContain("og:title");
    expect(output.faviconSvg).toContain("<svg");
    expect(output.staticAssets.map((asset) => asset.path)).toEqual(expect.arrayContaining(["index.html", "style.css", "script.js", "favicon.svg"]));
  });
});
