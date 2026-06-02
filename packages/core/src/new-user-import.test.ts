import { describe, expect, it } from "vitest";
import {
  exportNewUserDraftConfig,
  importNewUserDraftConfig,
  importNewUserFromReadme,
  importNewUserFromResumeText,
  importProjectsFromReadmes,
  importSkillsFromText,
  recommendTemplateFromImport
} from "./new-user-import";
import { defaultNewUserFormDraft } from "./new-user-form";

describe("new-user import", () => {
  it("imports README content into a draft", () => {
    const result = importNewUserFromReadme("# Hi\n\nBuilding projects.\n\n![TypeScript](https://img.shields.io/badge/TypeScript-70-blue)\n[Blog](https://example.com)");

    expect(result.acceptanceIds).toContain("N-IMP-001");
    expect(result.detected).toEqual(expect.arrayContaining(["headings", "links", "badges"]));
    expect(result.draft.skills.map((skill) => skill.name)).toContain("TypeScript");
  });

  it("imports resume text, project READMEs, and skill batches", () => {
    const resume = importNewUserFromResumeText("Example University\nSkills: TypeScript, React, PostgreSQL\nhello@example.com\nhttps://example.com");
    const project = importProjectsFromReadmes([{ name: "Course App", markdown: "Course project\n\n- React UI\n- PostgreSQL data\nCompleted." }]);
    const skills = importSkillsFromText("Python React Docker GitHub Actions");

    expect(resume.acceptanceIds).toContain("N-IMP-002");
    expect(project.acceptanceIds).toContain("N-IMP-003");
    expect(importProjectsFromReadmes([{ name: "A", markdown: "React" }, { name: "B", markdown: "Docker" }]).acceptanceIds).toContain("N-IMP-004");
    expect(skills.acceptanceIds).toContain("N-IMP-005");
    expect(project.draft.manualProjects[0].techStack).toEqual(expect.arrayContaining(["React", "PostgreSQL"]));
  });

  it("exports and imports personal configuration JSON", () => {
    const draft = defaultNewUserFormDraft("alex", "en-US");
    const json = exportNewUserDraftConfig(draft);
    const imported = importNewUserDraftConfig(json);
    const recommendation = recommendTemplateFromImport(imported);

    expect(json).toContain("schemaVersion");
    expect(imported.acceptanceIds).toContain("N-IMP-007");
    expect(recommendation.acceptanceIds).toEqual(expect.arrayContaining(["N-IMP-006", "N-IMP-007"]));
  });
});
