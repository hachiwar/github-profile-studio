import { describe, expect, it } from "vitest";
import { applyManualCopyEdits, generateNewUserCopy, regenerateCopyBlocks, translateCopyBlocks } from "./new-user-copy";
import { defaultNewUserFormDraft } from "./new-user-form";

describe("new-user copy generation", () => {
  it("generates all required bilingual copy blocks", () => {
    const draft = defaultNewUserFormDraft("alex", "bilingual");
    const result = generateNewUserCopy(draft, { tone: "friendly" });

    expect(result.acceptanceIds).toEqual(expect.arrayContaining([
      "N-TEXT-001",
      "N-TEXT-002",
      "N-TEXT-003",
      "N-TEXT-004",
      "N-TEXT-005",
      "N-TEXT-006",
      "N-TEXT-007",
      "N-TEXT-008",
      "N-TEXT-009",
      "N-TEXT-010"
    ]));
    expect(result.blocks).toHaveLength(10);
    expect(result.blocks.find((block) => block.id === "zh-intro")?.text).toContain("我是");
    expect(result.blocks.find((block) => block.id === "en-intro")?.text).toContain("I'm");
    expect(result.blocks.find((block) => block.id === "empty-data")?.text).toContain("GitHub activity");
  });

  it("supports tone switching, manual edits, regeneration, locks, and preservation", () => {
    const draft = defaultNewUserFormDraft("alex", "en-US");
    const confident = generateNewUserCopy(draft, { tone: "confident" });
    const manuallyEdited = applyManualCopyEdits(confident, { "project-intro": "Manual project story that must survive." });
    const locked = {
      ...manuallyEdited,
      blocks: manuallyEdited.blocks.map((block) => (block.id === "project-intro" ? { ...block, locked: true } : block))
    };
    const regenerated = regenerateCopyBlocks(draft, locked, { tone: "concise" });

    expect(confident.acceptanceIds).toEqual(expect.arrayContaining(["N-TEXT-011", "N-TEXT-012", "N-TEXT-013", "N-TEXT-014", "N-TEXT-016"]));
    expect(regenerated.blocks.find((block) => block.id === "project-intro")?.text).toBe("Manual project story that must survive.");
    expect(regenerated.blocks.find((block) => block.id === "en-intro")?.tone).toBe("concise");
  });

  it("translates generated blocks between English, Chinese, and bilingual output", () => {
    const draft = defaultNewUserFormDraft("alex", "en-US");
    const result = generateNewUserCopy(draft);
    const zh = translateCopyBlocks(result, "zh-CN");
    const bilingual = translateCopyBlocks(result, "bilingual");

    expect(result.acceptanceIds).toContain("N-TEXT-015");
    expect(zh.blocks.find((block) => block.id === "skill-stack")?.text).toContain("技能栈");
    expect(bilingual.blocks.find((block) => block.id === "learning-goals")?.text).toContain("\n");
  });
});
