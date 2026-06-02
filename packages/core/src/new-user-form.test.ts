import { describe, expect, it } from "vitest";
import { buildNewUserConfigFromDraft, defaultNewUserFormDraft, newUserFormCatalogEvidence, newUserFormDraftSchema, summarizeNewUserFormDraft } from "./new-user-form";

describe("new-user profile form", () => {
  it("validates the complete multi-step form draft", () => {
    const draft = defaultNewUserFormDraft("alex", "en-US");
    const parsed = newUserFormDraftSchema.parse(draft);
    const summary = summarizeNewUserFormDraft(parsed);

    expect(summary.acceptanceIds).toEqual([
      "N-FORM-001",
      "N-FORM-002",
      "N-FORM-003",
      "N-FORM-004",
      "N-FORM-005",
      "N-FORM-006",
      "N-FORM-007",
      "N-FORM-008",
      "N-FORM-009",
      "N-FORM-010",
      "N-FORM-011",
      "N-FORM-012",
      "N-FORM-013",
      "N-FORM-014"
    ]);
    expect(summary.fields.education).toBeGreaterThan(0);
    expect(summary.fields.programmingLanguages).toBeGreaterThan(0);
    expect(summary.fields.skills).toBeGreaterThan(0);
    expect(summary.fields.manualProjects).toBeGreaterThan(0);
    expect(newUserFormCatalogEvidence.learningDirections).toBeGreaterThanOrEqual(20);
    expect(newUserFormCatalogEvidence.programmingLanguages).toBeGreaterThanOrEqual(20);
    expect(newUserFormCatalogEvidence.skillCategories).toEqual(expect.arrayContaining(["frontend", "backend", "database", "devops"]));
  });

  it("maps the form draft into README-ready profile configuration", () => {
    const draft = defaultNewUserFormDraft("alex", "en-US");
    draft.basics.displayName = "Alex Chen";
    draft.basics.oneLineIntro = "Building accessible developer tools.";
    draft.highlights = ["Project-based learner", "Open-source newcomer"];
    draft.display.showContributionCalendar = false;
    draft.contact.showResume = true;
    draft.privacy.hideEmailInReadme = true;

    const config = buildNewUserConfigFromDraft(draft);
    expect(config.profile.displayName).toBe("Alex Chen");
    expect(config.skills.map((skill) => skill.name)).toEqual(expect.arrayContaining(["TypeScript", "Python", "React"]));
    expect(config.enabledReadmeModules).not.toContain("contribution-calendar");
    expect(config.socialLinks.some((link) => link.provider === "Resume" && link.showInPages)).toBe(true);
    expect(config.profile.bio).toContain("Building accessible developer tools.");
    expect(config.manualProjects.map((project) => project.name)).toContain("Personal Profile Studio");
  });

  it("applies privacy switches before public README generation", () => {
    const draft = defaultNewUserFormDraft("alex", "en-US");
    draft.privacy.hideRealName = true;
    draft.privacy.hideLocation = true;
    draft.contact.showEmail = true;
    draft.privacy.hideEmailInReadme = true;

    const config = buildNewUserConfigFromDraft(draft);

    expect(config.profile.displayName).toBe(draft.basics.nickname);
    expect(config.profile.location).toBeUndefined();
    expect(config.profile.email).toBeUndefined();
    expect(config.privacy.find((setting) => setting.key === "email")?.visibleInReadme).toBe(false);
  });
});
