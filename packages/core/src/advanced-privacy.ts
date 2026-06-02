import type { NewUserFormDraft } from "./new-user-form";
import { newUserFormDraftSchema } from "./new-user-form";

export type PrivacyFieldKey =
  | "realName"
  | "school"
  | "major"
  | "degree"
  | "gpa"
  | "graduationYear"
  | "email"
  | "resume"
  | "city"
  | "social"
  | "jobSeeking";

export type FieldPrivacyControl = {
  field: PrivacyFieldKey;
  showInReadme: boolean;
  showInPages: boolean;
  obfuscate?: boolean;
  deleteValue?: boolean;
};

export type PreSubmitPrivacyIssue = {
  field: PrivacyFieldKey;
  severity: "info" | "warning" | "critical";
  message: string;
  destination: "readme" | "pages";
};

export const defaultFieldPrivacyControls: FieldPrivacyControl[] = [
  { field: "realName", showInReadme: true, showInPages: true, obfuscate: false },
  { field: "school", showInReadme: true, showInPages: true, obfuscate: false },
  { field: "major", showInReadme: true, showInPages: true },
  { field: "degree", showInReadme: true, showInPages: true },
  { field: "gpa", showInReadme: false, showInPages: false, obfuscate: true },
  { field: "graduationYear", showInReadme: true, showInPages: true },
  { field: "email", showInReadme: false, showInPages: true, obfuscate: true },
  { field: "resume", showInReadme: false, showInPages: true },
  { field: "city", showInReadme: true, showInPages: true },
  { field: "social", showInReadme: true, showInPages: true },
  { field: "jobSeeking", showInReadme: false, showInPages: true }
];

export function applyFieldPrivacyControls(input: NewUserFormDraft, controls: FieldPrivacyControl[] = defaultFieldPrivacyControls): NewUserFormDraft {
  const draft = structuredClone(newUserFormDraftSchema.parse(input));
  const byField = new Map(controls.map((control) => [control.field, control]));

  if (hidden(byField, "realName", "readme") && hidden(byField, "realName", "pages")) draft.basics.displayName = draft.basics.nickname || "Developer";
  if (hidden(byField, "city", "readme") && hidden(byField, "city", "pages")) draft.basics.location = undefined;
  if (hidden(byField, "email", "readme")) draft.privacy.hideEmailInReadme = true;
  if (hidden(byField, "email", "readme") && hidden(byField, "email", "pages")) {
    draft.basics.email = undefined;
    draft.contact.showEmail = false;
  }
  if (hidden(byField, "resume", "readme") && hidden(byField, "resume", "pages")) {
    draft.basics.resumeUrl = undefined;
    draft.contact.showResume = false;
  }
  if (hidden(byField, "social", "readme") && hidden(byField, "social", "pages")) draft.basics.socialLinks = [];
  if (hidden(byField, "jobSeeking", "readme") && hidden(byField, "jobSeeking", "pages")) draft.learning.jobPlan = undefined;

  draft.education = draft.education.map((education) => ({
    ...education,
    school: hidden(byField, "school", "readme") && hidden(byField, "school", "pages") ? undefined : obfuscate(byField, "school", education.school, "School"),
    major: hidden(byField, "major", "readme") && hidden(byField, "major", "pages") ? undefined : education.major,
    degree: hidden(byField, "degree", "readme") && hidden(byField, "degree", "pages") ? undefined : education.degree,
    gpa: hidden(byField, "gpa", "readme") && hidden(byField, "gpa", "pages") ? undefined : education.gpa,
    graduationYear: hidden(byField, "graduationYear", "readme") && hidden(byField, "graduationYear", "pages") ? undefined : education.graduationYear,
    visibility: {
      readme: education.visibility.readme && !hidden(byField, "school", "readme"),
      pages: education.visibility.pages && !hidden(byField, "school", "pages")
    }
  }));

  return draft;
}

export function runPreSubmitPrivacyCheck(input: NewUserFormDraft, controls: FieldPrivacyControl[] = defaultFieldPrivacyControls): PreSubmitPrivacyIssue[] {
  const draft = newUserFormDraftSchema.parse(input);
  const issues: PreSubmitPrivacyIssue[] = [];
  const byField = new Map(controls.map((control) => [control.field, control]));

  if (draft.basics.email && !hidden(byField, "email", "readme")) issues.push(issue("email", "critical", "Email is visible in README.", "readme"));
  if (draft.education.some((item) => item.gpa) && !hidden(byField, "gpa", "readme")) issues.push(issue("gpa", "critical", "GPA is visible in README.", "readme"));
  if (draft.basics.resumeUrl && !hidden(byField, "resume", "pages")) issues.push(issue("resume", "warning", "Resume link is visible on Pages.", "pages"));
  if (draft.learning.jobPlan && !hidden(byField, "jobSeeking", "pages")) issues.push(issue("jobSeeking", "info", "Job-seeking status is visible on Pages.", "pages"));
  return issues;
}

export function hideAllSensitiveData(input: NewUserFormDraft): NewUserFormDraft {
  return applyFieldPrivacyControls(input, defaultFieldPrivacyControls.map((control) => ({ ...control, showInReadme: false, showInPages: false, obfuscate: true })));
}

export function obfuscatePrivacyText(value: string | undefined, fallback: string): string | undefined {
  if (!value) return value;
  return fallback;
}

export function protectEmail(email: string | undefined): string | undefined {
  if (!email) return undefined;
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name[0]}***@${domain.replace(/\./g, "[dot]")}`;
}

export function deletePersonalInfo(input: NewUserFormDraft): NewUserFormDraft {
  const draft = hideAllSensitiveData(input);
  draft.basics.displayName = draft.basics.nickname || draft.username;
  draft.basics.email = undefined;
  draft.basics.resumeUrl = undefined;
  draft.basics.location = undefined;
  draft.basics.socialLinks = [];
  draft.learning.jobPlan = undefined;
  return draft;
}

export const advancedPrivacyAcceptanceIds = [
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
  "N-PRIV-012",
  "N-PRIV-013",
  "N-PRIV-014",
  "N-PRIV-015",
  "N-PRIV-016",
  "N-PRIV-017"
];

function hidden(controls: Map<PrivacyFieldKey, FieldPrivacyControl>, field: PrivacyFieldKey, destination: "readme" | "pages"): boolean {
  const control = controls.get(field);
  if (!control) return false;
  return destination === "readme" ? !control.showInReadme : !control.showInPages;
}

function obfuscate(controls: Map<PrivacyFieldKey, FieldPrivacyControl>, field: PrivacyFieldKey, value: string | undefined, fallback: string): string | undefined {
  return controls.get(field)?.obfuscate ? obfuscatePrivacyText(value, fallback) : value;
}

function issue(field: PrivacyFieldKey, severity: PreSubmitPrivacyIssue["severity"], message: string, destination: PreSubmitPrivacyIssue["destination"]): PreSubmitPrivacyIssue {
  return { field, severity, message, destination };
}
