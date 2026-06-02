import type { PageVisualConfig } from "./page-visual";
import { defaultPageVisualConfig } from "./page-visual";
import type { NewUserFormDraft } from "./new-user-form";
import { newUserFormDraftSchema } from "./new-user-form";

export type NewUserSavedSnapshot = {
  schemaVersion: 1;
  id: string;
  username: string;
  savedAt: string;
  draft: NewUserFormDraft;
  pageVisual: PageVisualConfig;
  savedSections: {
    basics: boolean;
    education: boolean;
    skills: boolean;
    learningDirections: boolean;
    manualProjects: boolean;
    learningPlan: boolean;
    contact: boolean;
    templatesAndTheme: boolean;
  };
  acceptanceIds: string[];
};

export function createNewUserSavedSnapshot(draft: NewUserFormDraft, savedAt = new Date().toISOString()): NewUserSavedSnapshot {
  const parsed = newUserFormDraftSchema.parse(draft);
  return {
    schemaVersion: 1,
    id: `${parsed.username}-${Date.parse(savedAt) || Date.now()}`,
    username: parsed.username,
    savedAt,
    draft: parsed,
    pageVisual: defaultPageVisualConfig(parsed),
    savedSections: {
      basics: true,
      education: parsed.education.length > 0,
      skills: parsed.skills.length + parsed.languages.length > 0,
      learningDirections: parsed.learning.directions.length > 0,
      manualProjects: parsed.manualProjects.length > 0,
      learningPlan: true,
      contact: true,
      templatesAndTheme: true
    },
    acceptanceIds: [
      "N-SAVE-001",
      "N-SAVE-002",
      "N-SAVE-003",
      "N-SAVE-004",
      "N-SAVE-005",
      "N-SAVE-006",
      "N-SAVE-007",
      "N-SAVE-008",
      "N-SAVE-009"
    ]
  };
}

export function appendNewUserVersion(history: NewUserSavedSnapshot[], snapshot: NewUserSavedSnapshot, limit = 20): NewUserSavedSnapshot[] {
  return [snapshot, ...history.filter((item) => item.id !== snapshot.id)].slice(0, limit);
}

export function restoreNewUserSnapshot(snapshot: NewUserSavedSnapshot): NewUserFormDraft {
  return newUserFormDraftSchema.parse(snapshot.draft);
}

export function exportNewUserConfiguration(snapshot: NewUserSavedSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}
