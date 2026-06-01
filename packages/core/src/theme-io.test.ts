import { describe, expect, it } from "vitest";
import { buildThemeShareLink, exportThemeJson, importThemeJson } from "./theme-io";

describe("theme import/export", () => {
  it("exports and imports theme JSON", () => {
    const exported = exportThemeJson("github-native");
    const imported = importThemeJson(exported);
    expect(imported.valid).toBe(true);
    expect(imported.theme?.key).toBe("github-native");
  });

  it("rejects invalid theme payloads", () => {
    const imported = importThemeJson({ nope: true });
    expect(imported.valid).toBe(false);
    expect(imported.errors.length).toBeGreaterThan(0);
  });

  it("builds stable share links", () => {
    const link = buildThemeShareLink("minimal-dark", "https://studio.example/");
    expect(link).toContain("theme=minimal-dark");
    expect(link).toContain("share=");
  });
});

