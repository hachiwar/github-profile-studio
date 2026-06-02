import { describe, expect, it } from "vitest";
import { builtinPageTemplates, builtinReadmeTemplates, builtinThemePresets } from "./templates";

describe("built-in template registry", () => {
  it("binds every README template to its acceptance id", () => {
    expect(builtinReadmeTemplates).toHaveLength(15);
    for (const [index, template] of builtinReadmeTemplates.entries()) {
      expect(template.acceptanceIds).toContain(`N-RT-${String(index + 1).padStart(3, "0")}`);
      expect(template.name.en).toBeTruthy();
      expect(template.name.zh).toBeTruthy();
    }
  });

  it("binds every Pages template to its acceptance id", () => {
    expect(builtinPageTemplates).toHaveLength(15);
    for (const [index, template] of builtinPageTemplates.entries()) {
      expect(template.acceptanceIds).toContain(`N-PT-${String(index + 1).padStart(3, "0")}`);
      expect(template.name.en).toBeTruthy();
      expect(template.name.zh).toBeTruthy();
    }
  });

  it("registers the 15 required built-in theme presets", () => {
    expect(builtinThemePresets.map((theme) => theme.key)).toEqual([
      "github-native",
      "minimal-light",
      "minimal-dark",
      "cyber-neon",
      "terminal-green",
      "glassmorphism",
      "bento-grid",
      "academic",
      "developer-portfolio",
      "open-source-hero",
      "pixel-art",
      "apple-clean",
      "dashboard-pro",
      "ocean-blue",
      "sunset-gradient"
    ]);
    for (const theme of builtinThemePresets) {
      expect(theme.name.en).toBeTruthy();
      expect(theme.name.zh).toBeTruthy();
      expect(theme.tokens.primary).toMatch(/^#/);
      expect(theme.tokens.background).toMatch(/^#/);
    }
  });
});
