import Link from "next/link";
import { ArrowRight, BadgeCheck, Code2, GitBranch, Languages, ShieldCheck } from "lucide-react";
import { builtinThemePresets, generationModes } from "@gps/core";
import type { LucideIcon } from "lucide-react";

const features: Array<[string, string, LucideIcon]> = [
  ["Username detection", "Profile URLs, repository URLs, user/org status, README and Pages state.", GitBranch],
  ["New-user automation", "Complete profile output even with zero commits or repositories.", BadgeCheck],
  ["Dynamic card API", "SVG, PNG, JSON, Markdown image links, HTML snippets, and OG images.", Code2],
  ["Privacy controls", "Separate README and Pages visibility, sensitive-data checks, and one-click hiding.", ShieldCheck],
  ["Bilingual output", "English default, Chinese option, and bilingual generation for global profiles.", Languages]
];

export default function HomePage() {
  return (
    <main>
      <section className="border-b">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              README, Pages, Cards, Achievements
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              Build a complete GitHub profile presence from one studio.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Enter a GitHub username, enrich it with optional profile details, and generate a
              Profile README, GitHub Pages site, dynamic cards, achievement wall, and automation
              workflows. English is the default output language, with Chinese and bilingual modes
              available.
            </p>
            <form action="/generate" className="mt-8 flex flex-col gap-3 sm:flex-row">
              <input
                name="username"
                aria-label="GitHub username"
                placeholder="torvalds or https://github.com/vercel/next.js"
                className="min-h-12 flex-1 rounded-md border bg-white px-4 outline-none ring-blue-500 focus:ring-2"
              />
              <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 font-medium text-white hover:bg-blue-700">
                Generate <ArrowRight size={18} />
              </button>
            </form>
            <div className="mt-6 flex flex-wrap gap-2 text-sm text-slate-600">
              {generationModes.map((mode) => (
                <span key={mode.key} className="rounded-full border px-3 py-1">
                  {mode.label.en}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {features.map(([title, body, Icon]) => (
              <article key={String(title)} className="rounded-lg border bg-white p-5 shadow-sm">
                <Icon className="mb-4 text-blue-600" size={24} />
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Built-in themes</h2>
            <p className="mt-2 text-slate-600">Themes are shared by README, Pages, cards, and achievement walls.</p>
          </div>
          <Link href="/templates" className="text-sm font-medium text-blue-600">
            Browse templates
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {builtinThemePresets.slice(0, 10).map((theme) => (
            <div key={theme.key} className="rounded-lg border p-4">
              <div className="mb-3 flex gap-2">
                <span className="h-5 w-5 rounded-full" style={{ background: theme.tokens.primary }} />
                <span className="h-5 w-5 rounded-full" style={{ background: theme.tokens.accent }} />
                <span className="h-5 w-5 rounded-full border" style={{ background: theme.tokens.background }} />
              </div>
              <p className="font-medium">{theme.name.en}</p>
              <p className="mt-1 text-xs text-slate-500">{theme.category}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
