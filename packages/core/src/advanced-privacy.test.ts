import { describe, expect, it } from "vitest";
import {
  advancedPrivacyAcceptanceIds,
  applyFieldPrivacyControls,
  defaultFieldPrivacyControls,
  deletePersonalInfo,
  hideAllSensitiveData,
  obfuscatePrivacyText,
  protectEmail,
  runPreSubmitPrivacyCheck
} from "./advanced-privacy";
import { defaultNewUserFormDraft } from "./new-user-form";

describe("advanced privacy controls", () => {
  it("supports field-level README and Pages controls", () => {
    const draft = defaultNewUserFormDraft("alex", "en-US");
    draft.education[0].gpa = "4.0";
    const hidden = applyFieldPrivacyControls(draft, defaultFieldPrivacyControls.map((control) => ({ ...control, showInReadme: false, showInPages: false, obfuscate: true })));

    expect(advancedPrivacyAcceptanceIds).toEqual(expect.arrayContaining([
      "N-PRIV-001",
      "N-PRIV-002",
      "N-PRIV-003",
      "N-PRIV-004",
      "N-PRIV-005",
      "N-PRIV-006",
      "N-PRIV-007",
      "N-PRIV-008",
      "N-PRIV-009",
      "N-PRIV-010",
      "N-PRIV-011",
      "N-PRIV-012"
    ]));
    expect(hidden.basics.email).toBeUndefined();
    expect(hidden.basics.resumeUrl).toBeUndefined();
    expect(hidden.basics.location).toBeUndefined();
    expect(hidden.education[0].gpa).toBeUndefined();
    expect(hidden.education[0].school).toBeUndefined();
  });

  it("runs pre-submit checks, one-click hiding, obfuscation, email protection, and deletion", () => {
    const draft = defaultNewUserFormDraft("alex", "en-US");
    draft.education[0].gpa = "4.0";
    const issues = runPreSubmitPrivacyCheck(draft, [{ field: "email", showInReadme: true, showInPages: true }, { field: "gpa", showInReadme: true, showInPages: true }, { field: "resume", showInReadme: false, showInPages: true }, { field: "jobSeeking", showInReadme: false, showInPages: true }]);
    const hidden = hideAllSensitiveData(draft);
    const deleted = deletePersonalInfo(draft);

    expect(advancedPrivacyAcceptanceIds).toEqual(expect.arrayContaining(["N-PRIV-013", "N-PRIV-014", "N-PRIV-015", "N-PRIV-016", "N-PRIV-017"]));
    expect(issues.map((issue) => issue.field)).toEqual(expect.arrayContaining(["email", "gpa", "resume", "jobSeeking"]));
    expect(hidden.basics.email).toBeUndefined();
    expect(obfuscatePrivacyText("Example University", "School")).toBe("School");
    expect(protectEmail("hello@example.com")).toBe("h***@example[dot]com");
    expect(deleted.basics.socialLinks).toHaveLength(0);
  });
});
