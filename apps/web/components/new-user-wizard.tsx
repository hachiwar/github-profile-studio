"use client";

import { useMemo, useState } from "react";
import { buildNewUserConfig, programmingLanguageCatalog, skillCatalog, learningDirectionCatalog, summarizeNewUserConfig } from "@gps/core";
import { generateReadme } from "@gps/generators";

const steps = ["Basics", "Education", "Skills", "Projects", "Privacy", "Preview"];

export function NewUserWizard() {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("new-developer");
  const [locale, setLocale] = useState<"en-US" | "zh-CN" | "bilingual">("en-US");
  const config = useMemo(() => buildNewUserConfig(username || "new-developer", locale), [username, locale]);
  const summary = useMemo(() => summarizeNewUserConfig(config), [config]);
  const readme = useMemo(() => generateReadme(config), [config]);

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-lg border bg-white p-4">
        <h2 className="font-semibold">New-user automation</h2>
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
      </aside>
      <section className="rounded-lg border bg-white">
        <header className="border-b p-4">
          <h1 className="text-xl font-semibold">{steps[step]}</h1>
          <p className="mt-1 text-sm text-slate-600">English output is the default. Chinese and bilingual output remain available.</p>
        </header>
        <div className="grid gap-4 p-4 lg:grid-cols-[1fr_420px]">
          <div className="space-y-4">
            {step === 0 && (
              <div className="grid gap-4">
                <label className="grid gap-2 text-sm font-medium">
                  GitHub username
                  <input value={username} onChange={(event) => setUsername(event.target.value)} className="rounded-md border px-3 py-2" />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Output language
                  <select value={locale} onChange={(event) => setLocale(event.target.value as typeof locale)} className="rounded-md border px-3 py-2">
                    <option value="en-US">English</option>
                    <option value="zh-CN">中文</option>
                    <option value="bilingual">English + 中文</option>
                  </select>
                </label>
              </div>
            )}
            {step === 1 && (
              <Checklist
                title="Education fields"
                items={["School", "Department", "Major", "Degree", "Start year", "Graduation year", "Courses", "Honors", "README visibility", "Pages visibility"]}
              />
            )}
            {step === 2 && (
              <div className="grid gap-4">
                <Checklist title="Learning directions" items={learningDirectionCatalog.slice(0, 12)} />
                <Checklist title="Programming languages" items={programmingLanguageCatalog.slice(0, 14)} />
                <Checklist title="Skill stack" items={[...skillCatalog.frontend.slice(0, 6), ...skillCatalog.backend.slice(0, 5), ...skillCatalog.database.slice(0, 4)]} />
              </div>
            )}
            {step === 3 && (
              <Checklist
                title="Manual projects"
                items={["Name", "Summary", "Project type", "Status", "Tech stack", "Highlights", "Role", "Repo URL", "Demo URL", "Screenshot", "Featured", "README visibility", "Pages visibility"]}
              />
            )}
            {step === 4 && (
              <div>
                <h3 className="font-semibold">Privacy warnings</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {summary.privacyWarnings.map((warning) => (
                    <li key={`${warning.field}-${warning.scope}`} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                      {warning.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {step === 5 && (
              <pre className="max-h-[520px] overflow-auto rounded-md border bg-slate-950 p-4 text-sm leading-6 text-slate-50">
                {readme.markdown}
              </pre>
            )}
          </div>
          <aside className="rounded-lg border bg-slate-50 p-4">
            <h3 className="font-semibold">Generated plan</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-medium">Mode</dt>
                <dd className="text-slate-600">{summary.mode}</dd>
              </div>
              <div>
                <dt className="font-medium">README template</dt>
                <dd className="text-slate-600">{summary.readmeTemplateKey}</dd>
              </div>
              <div>
                <dt className="font-medium">Pages template</dt>
                <dd className="text-slate-600">{summary.pageTemplateKey}</dd>
              </div>
              <div>
                <dt className="font-medium">README modules</dt>
                <dd className="text-slate-600">{summary.readmeModules.join(", ")}</dd>
              </div>
            </dl>
          </aside>
        </div>
        <footer className="flex justify-between border-t p-4">
          <button type="button" onClick={() => setStep(Math.max(0, step - 1))} className="rounded-md border px-3 py-2 text-sm">
            Back
          </button>
          <button type="button" onClick={() => setStep(Math.min(steps.length - 1, step + 1))} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white">
            Next
          </button>
        </footer>
      </section>
    </div>
  );
}

function Checklist({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <input type="checkbox" defaultChecked className="h-4 w-4" />
            {item}
          </label>
        ))}
      </div>
    </div>
  );
}

