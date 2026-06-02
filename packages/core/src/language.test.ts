import { describe, expect, it } from "vitest";
import { localeDate, localeNumber, localize } from "./language";

describe("language helpers", () => {
  it("localizes text in English, Chinese, and bilingual modes", () => {
    const text = { en: "Hello", zh: "你好" };
    expect(localize(text, "en-US")).toBe("Hello");
    expect(localize(text, "zh-CN")).toBe("你好");
    expect(localize(text, "bilingual")).toContain("Hello");
    expect(localize(text, "bilingual")).toContain("你好");
  });

  it("formats dates and numbers by locale", () => {
    expect(localeNumber(1234567, "en-US")).toBe("1,234,567");
    expect(localeNumber(1234567, "zh-CN")).toBe("1,234,567");
    expect(localeDate("2026-06-02T00:00:00.000Z", "en-US")).toContain("2026");
    expect(localeDate("2026-06-02T00:00:00.000Z", "zh-CN")).toContain("2026");
  });
});
