import { describe, expect, it } from "vitest";
import { builtinPageTemplates, builtinReadmeTemplates } from "./templates";

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
});
