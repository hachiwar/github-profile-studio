"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Download, Plus, Save, Trash2 } from "lucide-react";
import {
  buildNewUserConfigFromDraft,
  defaultNewUserFormDraft,
  learningDirectionCatalog,
  newUserFormDraftSchema,
  programmingLanguageCatalog,
  skillCatalog,
  splitList,
  summarizeNewUserConfig,
  summarizeNewUserFormDraft,
  detectUiLocale,
  getUiCopy,
  toUiLocale,
  type NewUserFormDraft
} from "@gps/core";
import { generateReadme } from "@gps/generators/readme";

const stepKeys = ["stepBasics", "stepEducation", "stepSkills", "stepProjects", "stepPlan", "stepPrivacy", "stepPreview"] as const;
const localStorageKey = "gps:new-user-form";

export function NewUserWizard() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<NewUserFormDraft>(() => defaultNewUserFormDraft("new-developer", browserOutputLocale()));
  const uiLocale = toUiLocale(draft.locale);
  const copy = useMemo(() => getUiCopy(uiLocale), [uiLocale]);
  const steps = useMemo(() => stepKeys.map((key) => copy[key]), [copy]);
  const [saveState, setSaveState] = useState(() => getUiCopy(browserUiLocale()).draftNotSaved);
  const config = useMemo(() => buildNewUserConfigFromDraft(draft), [draft]);
  const summary = useMemo(() => summarizeNewUserConfig(config), [config]);
  const formSummary = useMemo(() => summarizeNewUserFormDraft(draft), [draft]);
  const readme = useMemo(() => generateReadme(config), [config]);

  useEffect(() => {
    const saved = window.localStorage.getItem(localStorageKey);
    if (!saved) return;
    const parsed = newUserFormDraftSchema.safeParse(JSON.parse(saved));
    if (parsed.success) setDraft(parsed.data);
  }, []);

  function setUsername(username: string) {
    setDraft((current) => ({
      ...current,
      username,
      basics: {
        ...current.basics,
        socialLinks: current.basics.socialLinks.map((link) => (link.provider === "GitHub" ? { ...link, url: `https://github.com/${username}` } : link))
      }
    }));
  }

  function updateBasics<K extends keyof NewUserFormDraft["basics"]>(key: K, value: NewUserFormDraft["basics"][K]) {
    setDraft((current) => ({ ...current, basics: { ...current.basics, [key]: value } }));
  }

  function updateEducation(index: number, patch: Partial<NewUserFormDraft["education"][number]>) {
    setDraft((current) => ({ ...current, education: current.education.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)) }));
  }

  function updateLanguage(index: number, patch: Partial<NewUserFormDraft["languages"][number]>) {
    setDraft((current) => ({ ...current, languages: current.languages.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)) }));
  }

  function updateSkill(index: number, patch: Partial<NewUserFormDraft["skills"][number]>) {
    setDraft((current) => ({ ...current, skills: current.skills.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)) }));
  }

  function updateProject(index: number, patch: Partial<NewUserFormDraft["manualProjects"][number]>) {
    setDraft((current) => ({ ...current, manualProjects: current.manualProjects.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)) }));
  }

  function updateLearning<K extends keyof NewUserFormDraft["learning"]>(key: K, value: NewUserFormDraft["learning"][K]) {
    setDraft((current) => ({ ...current, learning: { ...current.learning, [key]: value } }));
  }

  function updateDisplay<K extends keyof NewUserFormDraft["display"]>(key: K, value: boolean) {
    setDraft((current) => ({ ...current, display: { ...current.display, [key]: value } }));
  }

  function updatePrivacy<K extends keyof NewUserFormDraft["privacy"]>(key: K, value: boolean) {
    setDraft((current) => ({ ...current, privacy: { ...current.privacy, [key]: value } }));
  }

  async function saveDraft() {
    const parsed = newUserFormDraftSchema.parse(draft);
    window.localStorage.setItem(localStorageKey, JSON.stringify(parsed));
    setSaveState(copy.saving);
    const response = await fetch("/api/new-user/profile-form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed)
    });
    const result = await response.json();
    setSaveState(result.saved ? `${copy.savedAt} ${new Date(result.savedAt).toLocaleTimeString()}` : copy.saveFailed);
  }

  async function copyMarkdown() {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(readme.markdown);
      } catch {
        fallbackCopy(readme.markdown);
      }
    } else {
      fallbackCopy(readme.markdown);
    }
    setSaveState(copy.copied);
  }

  function downloadReadme() {
    const blob = new Blob([readme.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "README.md";
    link.click();
    URL.revokeObjectURL(url);
    setSaveState(copy.downloaded);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-lg border bg-white p-4">
        <h2 className="font-semibold">{copy.newUserAutomation}</h2>
        <p className="mt-2 text-sm text-slate-600">{copy.newUserDescription}</p>
        <ol className="mt-4 space-y-2">
          {steps.map((label, index) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => setStep(index)}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm ${index === step ? "border-blue-600 bg-blue-50 text-blue-700" : "hover:bg-muted"}`}
              >
                {index + 1}. {label}
              </button>
            </li>
          ))}
        </ol>
        <button type="button" onClick={saveDraft} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white">
          <Save className="h-4 w-4" />
          {copy.saveDraft}
        </button>
        <p className="mt-2 text-xs text-slate-500">{saveState}</p>
      </aside>

      <section className="rounded-lg border bg-white">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div>
            <h1 className="text-xl font-semibold">{steps[step]}</h1>
            <p className="mt-1 text-sm text-slate-600">{formSummary.fields.manualProjects} projects, {formSummary.fields.skills + formSummary.fields.programmingLanguages} skills, {formSummary.fields.learningDirections} learning directions.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={copyMarkdown} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <Copy className="h-4 w-4" />
              {copy.copy}
            </button>
            <button type="button" onClick={downloadReadme} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <Download className="h-4 w-4" />
              {copy.download}
            </button>
          </div>
        </header>

        <div className="grid gap-4 p-4 xl:grid-cols-[1fr_420px]">
          <div className="space-y-4">
            {step === 0 && (
              <FormPanel title="Basic profile">
                <div className="grid gap-3 md:grid-cols-2">
                  <TextField label="GitHub username" value={draft.username} onChange={setUsername} />
                  <SelectField label={copy.outputLanguage} value={draft.locale} onChange={(value) => setDraft((current) => ({ ...current, locale: value as NewUserFormDraft["locale"] }))} options={["en-US", "zh-CN", "bilingual"]} />
                  <TextField label="Display name" value={draft.basics.displayName} onChange={(value) => updateBasics("displayName", value)} />
                  <TextField label="Nickname" value={draft.basics.nickname} onChange={(value) => updateBasics("nickname", value)} />
                  <TextField label="Avatar URL" value={draft.basics.avatarUrl} onChange={(value) => updateBasics("avatarUrl", value || undefined)} />
                  <TextField label="Current identity" value={draft.basics.currentRole} onChange={(value) => updateBasics("currentRole", value)} />
                  <TextField label="Location" value={draft.basics.location} onChange={(value) => updateBasics("location", value)} />
                  <TextField label="Email" value={draft.basics.email} onChange={(value) => updateBasics("email", value || undefined)} />
                  <TextField label="Website" value={draft.basics.website} onChange={(value) => updateBasics("website", value || undefined)} />
                  <TextField label="Blog" value={draft.basics.blog} onChange={(value) => updateBasics("blog", value || undefined)} />
                  <TextField label="Resume URL" value={draft.basics.resumeUrl} onChange={(value) => updateBasics("resumeUrl", value || undefined)} />
                </div>
                <TextArea label="One-line introduction" value={draft.basics.oneLineIntro} onChange={(value) => updateBasics("oneLineIntro", value)} />
                <TextArea label="Current status" value={draft.basics.status} onChange={(value) => updateBasics("status", value)} />
              </FormPanel>
            )}

            {step === 1 && (
              <FormPanel title="Education background">
                {draft.education.map((item, index) => (
                  <div key={index} className="grid gap-3 rounded-md border p-3 md:grid-cols-2">
                    <TextField label="School" value={item.school} onChange={(value) => updateEducation(index, { school: value })} />
                    <TextField label="Department" value={item.department} onChange={(value) => updateEducation(index, { department: value })} />
                    <TextField label="Major" value={item.major} onChange={(value) => updateEducation(index, { major: value })} />
                    <TextField label="Degree" value={item.degree} onChange={(value) => updateEducation(index, { degree: value })} />
                    <NumberField label="Start year" value={item.startYear} onChange={(value) => updateEducation(index, { startYear: value })} />
                    <NumberField label="Graduation year" value={item.graduationYear} onChange={(value) => updateEducation(index, { graduationYear: value })} />
                    <TextField label="Grade" value={item.grade} onChange={(value) => updateEducation(index, { grade: value })} />
                    <TextField label="GPA" value={item.gpa} onChange={(value) => updateEducation(index, { gpa: value })} />
                    <TextArea label="Courses" value={item.courses.join(", ")} onChange={(value) => updateEducation(index, { courses: splitList(value) })} />
                    <TextArea label="Honors" value={item.honors.join(", ")} onChange={(value) => updateEducation(index, { honors: splitList(value) })} />
                    <VisibilitySwitches value={item.visibility} onChange={(visibility) => updateEducation(index, { visibility })} />
                  </div>
                ))}
              </FormPanel>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <FormPanel title="Learning directions">
                  <CheckboxGrid
                    items={learningDirectionCatalog}
                    selected={draft.learning.directions}
                    onToggle={(item) =>
                      updateLearning(
                        "directions",
                        draft.learning.directions.includes(item) ? draft.learning.directions.filter((value) => value !== item) : [...draft.learning.directions, item]
                      )
                    }
                  />
                </FormPanel>
                <FormPanel title="Programming languages">
                  {draft.languages.map((language, index) => (
                    <div key={`${language.name}-${index}`} className="grid gap-3 rounded-md border p-3 md:grid-cols-[1fr_140px_1fr]">
                      <SelectField label="Language" value={language.name} onChange={(value) => updateLanguage(index, { name: value })} options={programmingLanguageCatalog} />
                      <NumberField label="Proficiency" value={language.proficiency} onChange={(value) => updateLanguage(index, { proficiency: value ?? 0 })} />
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <Toggle label="Learning" checked={language.isLearning} onChange={(value) => updateLanguage(index, { isLearning: value })} />
                        <Toggle label="Daily use" checked={language.isDailyUse} onChange={(value) => updateLanguage(index, { isDailyUse: value })} />
                        <Toggle label="Primary" checked={language.isPrimary} onChange={(value) => updateLanguage(index, { isPrimary: value })} />
                        <Toggle label="Skill cloud" checked={language.showSkillCloud} onChange={(value) => updateLanguage(index, { showSkillCloud: value })} />
                      </div>
                    </div>
                  ))}
                </FormPanel>
                <FormPanel title="Skill stack">
                  {draft.skills.map((skill, index) => (
                    <div key={`${skill.name}-${index}`} className="grid gap-3 rounded-md border p-3 md:grid-cols-[1fr_140px_140px_1fr]">
                      <TextField label="Skill" value={skill.name} onChange={(value) => updateSkill(index, { name: value })} />
                      <SelectField label="Category" value={skill.category} onChange={(value) => updateSkill(index, { category: value as NewUserFormDraft["skills"][number]["category"] })} options={["frontend", "backend", "database", "ai-data", "devops", "testing", "cloud", "other"]} />
                      <NumberField label="Proficiency" value={skill.proficiency} onChange={(value) => updateSkill(index, { proficiency: value ?? 0 })} />
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <Toggle label="Icon" checked={skill.showIcon} onChange={(value) => updateSkill(index, { showIcon: value })} />
                        <Toggle label="Badge" checked={skill.showBadge} onChange={(value) => updateSkill(index, { showBadge: value })} />
                      </div>
                    </div>
                  ))}
                </FormPanel>
              </div>
            )}

            {step === 3 && (
              <FormPanel title="Manual projects">
                {draft.manualProjects.map((project, index) => (
                  <div key={index} className="grid gap-3 rounded-md border p-3 md:grid-cols-2">
                    <TextField label="Project name" value={project.name} onChange={(value) => updateProject(index, { name: value })} />
                    <SelectField label="Project type" value={project.type} onChange={(value) => updateProject(index, { type: value as NewUserFormDraft["manualProjects"][number]["type"] })} options={["personal", "course", "competition", "team", "open-source", "planned"]} />
                    <SelectField label="Status" value={project.status} onChange={(value) => updateProject(index, { status: value as NewUserFormDraft["manualProjects"][number]["status"] })} options={["planned", "building", "completed", "maintained"]} />
                    <TextField label="Role" value={project.role} onChange={(value) => updateProject(index, { role: value })} />
                    <TextArea label="Summary" value={project.summary} onChange={(value) => updateProject(index, { summary: value })} />
                    <TextArea label="Tech stack" value={project.techStack.join(", ")} onChange={(value) => updateProject(index, { techStack: splitList(value) })} />
                    <TextArea label="Highlights" value={project.highlights.join(", ")} onChange={(value) => updateProject(index, { highlights: splitList(value) })} />
                    <TextField label="Repo URL" value={project.repoUrl} onChange={(value) => updateProject(index, { repoUrl: value || undefined })} />
                    <TextField label="Demo URL" value={project.demoUrl} onChange={(value) => updateProject(index, { demoUrl: value || undefined })} />
                    <TextField label="Screenshot URL" value={project.imageUrl} onChange={(value) => updateProject(index, { imageUrl: value || undefined })} />
                    <VisibilitySwitches value={project.visibility} onChange={(visibility) => updateProject(index, { visibility })} />
                    <Toggle label="Featured project" checked={project.featured} onChange={(value) => updateProject(index, { featured: value })} />
                  </div>
                ))}
              </FormPanel>
            )}

            {step === 4 && (
              <FormPanel title="Learning plan and highlights">
                <TextArea label="Current focus" value={draft.learning.currentFocus.join(", ")} onChange={(value) => updateLearning("currentFocus", splitList(value))} />
                <TextArea label="Books" value={draft.learning.books.join(", ")} onChange={(value) => updateLearning("books", splitList(value))} />
                <TextArea label="Courses" value={draft.learning.courses.join(", ")} onChange={(value) => updateLearning("courses", splitList(value))} />
                <TextArea label="Current projects" value={draft.learning.currentProjects.join(", ")} onChange={(value) => updateLearning("currentProjects", splitList(value))} />
                <TextArea label="Short-term goals" value={draft.learning.shortTermGoals.join(", ")} onChange={(value) => updateLearning("shortTermGoals", splitList(value))} />
                <TextArea label="Long-term goals" value={draft.learning.longTermGoals.join(", ")} onChange={(value) => updateLearning("longTermGoals", splitList(value))} />
                <TextArea label="Weekly plan" value={draft.learning.weeklyPlan} onChange={(value) => updateLearning("weeklyPlan", value)} />
                <TextArea label="Open-source plan" value={draft.learning.openSourcePlan} onChange={(value) => updateLearning("openSourcePlan", value)} />
                <TextArea label="Job plan" value={draft.learning.jobPlan} onChange={(value) => updateLearning("jobPlan", value)} />
                <TextArea label="Blog plan" value={draft.learning.blogPlan} onChange={(value) => updateLearning("blogPlan", value)} />
                <TextArea label="Algorithm plan" value={draft.learning.algorithmPlan} onChange={(value) => updateLearning("algorithmPlan", value)} />
                <TextArea label="Personal highlights" value={draft.highlights.join(", ")} onChange={(value) => setDraft((current) => ({ ...current, highlights: splitList(value) }))} />
              </FormPanel>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <FormPanel title="Display switches">
                  <div className="grid gap-2 md:grid-cols-2">
                    {Object.entries(draft.display).map(([key, value]) => (
                      <Toggle key={key} label={labelize(key)} checked={value} onChange={(checked) => updateDisplay(key as keyof NewUserFormDraft["display"], checked)} />
                    ))}
                  </div>
                </FormPanel>
                <FormPanel title="Privacy controls">
                  <div className="grid gap-2 md:grid-cols-2">
                    {Object.entries(draft.privacy).map(([key, value]) => (
                      <Toggle key={key} label={labelize(key)} checked={value} onChange={(checked) => updatePrivacy(key as keyof NewUserFormDraft["privacy"], checked)} />
                    ))}
                  </div>
                  <ul className="mt-4 space-y-2 text-sm">
                    {summary.privacyWarnings.map((warning) => (
                      <li key={`${warning.field}-${warning.scope}`} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                        {warning.message}
                      </li>
                    ))}
                  </ul>
                </FormPanel>
              </div>
            )}

            {step === 6 && (
              <FormPanel title="Live README preview">
                <pre className="max-h-[560px] overflow-auto rounded-md border bg-slate-950 p-4 text-sm leading-6 text-slate-50">{readme.markdown}</pre>
              </FormPanel>
            )}
          </div>

          <aside className="rounded-lg border bg-slate-50 p-4">
            <h3 className="font-semibold">Generated plan</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <PlanRow label="Mode" value={summary.mode} />
              <PlanRow label="README template" value={summary.readmeTemplateKey} />
              <PlanRow label="Pages template" value={summary.pageTemplateKey} />
              <PlanRow label="README modules" value={summary.readmeModules.join(", ")} />
              <PlanRow label="Acceptance coverage" value={formSummary.acceptanceIds.join(", ")} />
            </dl>
            <div className="mt-5 rounded-md border bg-white p-3">
              <h4 className="text-sm font-semibold">Empty-data policy</h4>
              <p className="mt-2 text-sm text-slate-600">Sparse GitHub data is replaced with education, learning plans, manual projects, and privacy-safe contact sections.</p>
            </div>
          </aside>
        </div>

        <footer className="flex flex-wrap justify-between gap-2 border-t p-4">
          <button type="button" onClick={() => setStep(Math.max(0, step - 1))} className="rounded-md border px-3 py-2 text-sm">
            {copy.previous}
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={() => setDraft((current) => ({ ...current, manualProjects: [...current.manualProjects, defaultNewUserFormDraft(current.username, current.locale).manualProjects[0]] }))} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <Plus className="h-4 w-4" />
              Project
            </button>
            <button type="button" onClick={() => setDraft((current) => ({ ...current, manualProjects: current.manualProjects.slice(0, -1) }))} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <Trash2 className="h-4 w-4" />
              Project
            </button>
            <button type="button" onClick={() => setStep(Math.min(steps.length - 1, step + 1))} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white">
              {copy.next}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

function FormPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border bg-white p-4">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="rounded-md border px-3 py-2 font-normal" />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value?: number; onChange: (value: number | undefined) => void }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input type="number" value={value ?? ""} onChange={(event) => onChange(event.target.value ? Number(event.target.value) : undefined)} className="rounded-md border px-3 py-2 font-normal" />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-medium md:col-span-2">
      {label}
      <textarea value={value ?? ""} onChange={(event) => onChange(event.target.value)} rows={3} className="rounded-md border px-3 py-2 font-normal" />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-md border px-3 py-2 font-normal">
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4" />
    </label>
  );
}

function VisibilitySwitches({ value, onChange }: { value: { readme: boolean; pages: boolean }; onChange: (value: { readme: boolean; pages: boolean }) => void }) {
  return (
    <div className="grid gap-2 text-sm">
      <Toggle label="Show in README" checked={value.readme} onChange={(checked) => onChange({ ...value, readme: checked })} />
      <Toggle label="Show in Pages" checked={value.pages} onChange={(checked) => onChange({ ...value, pages: checked })} />
    </div>
  );
}

function CheckboxGrid({ items, selected, onToggle }: { items: string[]; selected: string[]; onToggle: (item: string) => void }) {
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {items.map((item) => (
        <label key={item} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <input type="checkbox" checked={selected.includes(item)} onChange={() => onToggle(item)} className="h-4 w-4" />
          {item}
        </label>
      ))}
    </div>
  );
}

function PlanRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium">{label}</dt>
      <dd className="text-slate-600">{value}</dd>
    </div>
  );
}

function labelize(value: string): string {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function browserOutputLocale(): NewUserFormDraft["locale"] {
  if (browserUiLocale() === "zh-CN") return "zh-CN";
  return "en-US";
}

function browserUiLocale() {
  if (typeof navigator !== "undefined") return detectUiLocale([navigator.language, ...Array.from(navigator.languages ?? [])]);
  return "en-US";
}

function fallbackCopy(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
