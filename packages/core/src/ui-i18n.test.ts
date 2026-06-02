import { describe, expect, it } from "vitest";
import { detectUiLocale, getUiCopy, getUiLabel, toUiLocale, uiCopyAcceptanceIds } from "./ui-i18n";

describe("UI i18n catalog", () => {
  it("defaults to English and follows browser Chinese language tags", () => {
    expect(detectUiLocale()).toBe("en-US");
    expect(detectUiLocale("en-US,en;q=0.9")).toBe("en-US");
    expect(detectUiLocale("zh-CN,en-US;q=0.8")).toBe("zh-CN");
    expect(detectUiLocale(["fr-FR", "zh-Hans"])).toBe("zh-CN");
  });

  it("exposes English and Chinese labels for product navigation and workflows", () => {
    const en = getUiCopy("en-US");
    const zh = getUiCopy("zh-CN");

    expect(en.newUserAutomation).toBe("New-user automation");
    expect(zh.newUserAutomation).toBe("新用户自动化");
    expect(zh.dashboard).toBe("工作台");
    expect(zh.oneClickSubmit).toBe("一键提交");
    expect(zh.diffPreview).toBe("差异预览");
    expect(getUiLabel("rollback", "zh-CN")).toBe("回滚");
    expect(toUiLocale("bilingual")).toBe("en-US");
    expect(uiCopyAcceptanceIds).toContain("13-001");
  });
});
