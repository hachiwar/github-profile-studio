import { describe, expect, it } from "vitest";
import { appendNewUserVersion, createNewUserSavedSnapshot, exportNewUserConfiguration, restoreNewUserSnapshot } from "./new-user-persistence";
import { defaultNewUserFormDraft } from "./new-user-form";

describe("new-user persistence", () => {
  it("captures every saved form section and template/theme settings", () => {
    const draft = defaultNewUserFormDraft("alex", "en-US");
    const snapshot = createNewUserSavedSnapshot(draft, "2026-06-02T00:00:00.000Z");

    expect(snapshot.acceptanceIds).toEqual(expect.arrayContaining([
      "N-SAVE-001",
      "N-SAVE-002",
      "N-SAVE-003",
      "N-SAVE-004",
      "N-SAVE-005",
      "N-SAVE-006",
      "N-SAVE-007",
      "N-SAVE-008"
    ]));
    expect(Object.values(snapshot.savedSections).every(Boolean)).toBe(true);
    expect(snapshot.pageVisual.seo.title).toContain("Alex Developer");
  });

  it("keeps version history and restores saved drafts", () => {
    const first = createNewUserSavedSnapshot(defaultNewUserFormDraft("alex", "en-US"), "2026-06-02T00:00:00.000Z");
    const secondDraft = defaultNewUserFormDraft("alex", "en-US");
    secondDraft.basics.displayName = "Alex Updated";
    const second = createNewUserSavedSnapshot(secondDraft, "2026-06-02T01:00:00.000Z");
    const history = appendNewUserVersion(appendNewUserVersion([], first), second);
    const restored = restoreNewUserSnapshot(history[0]);

    expect(second.acceptanceIds).toContain("N-SAVE-009");
    expect(history).toHaveLength(2);
    expect(restored.basics.displayName).toBe("Alex Updated");
    expect(exportNewUserConfiguration(second)).toContain("\"schemaVersion\": 1");
  });
});
