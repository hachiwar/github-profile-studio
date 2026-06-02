"use client";

import { useMemo, useState } from "react";
import { Clipboard, Download, FileCode2, GitPullRequest, History, Link2, Moon, PanelLeft, RotateCcw, Save, Sun } from "lucide-react";

type ModuleItem = {
  id: string;
  label: string;
};

type ReadmeWorkspaceProps = {
  username: string;
  themeKey: string;
  initialMarkdown: string;
  modules: ModuleItem[];
  stats: {
    contributions: number;
    stars: number;
    forks: number;
  };
  bio: string;
  cardUrl: string;
  htmlSnippet: string;
};

export function ReadmeWorkspace(props: ReadmeWorkspaceProps) {
  const [markdown, setMarkdown] = useState(props.initialMarkdown);
  const [darkPreview, setDarkPreview] = useState(false);
  const [modules, setModules] = useState(props.modules.map((module) => ({ ...module, enabled: true })));
  const visibleModules = modules.filter((module) => module.enabled);
  const headings = useMemo(() => extractHeadings(markdown), [markdown]);

  function toggleModule(id: string) {
    setModules((items) => items.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item));
  }

  function deleteModule(id: string) {
    setModules((items) => items.map((item) => item.id === id ? { ...item, enabled: false } : item));
  }

  function moveModule(id: string, direction: -1 | 1) {
    setModules((items) => {
      const index = items.findIndex((item) => item.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return items;
      const next = [...items];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
  }

  async function copyText(value: string) {
    await navigator.clipboard?.writeText(value);
  }

  function downloadReadme() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "README.md";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
        <div>
          <p className="text-sm font-medium text-blue-600">Workspace / @{props.username}</p>
          <h1 className="mt-1 text-3xl font-semibold">Profile README generator</h1>
          <p className="mt-2 text-slate-600">Current target type: Profile README. Theme: {props.themeKey}. Locale: en-US.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setDarkPreview(false)} className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm"><Sun size={16} /> Light</button>
          <button type="button" onClick={() => setDarkPreview(true)} className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm"><Moon size={16} /> Dark</button>
          <button type="button" onClick={() => copyText(JSON.stringify({ username: props.username, themeKey: props.themeKey, modules: visibleModules.map((item) => item.id) }, null, 2))} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white"><Save size={16} /> Save config</button>
        </div>
      </header>
      <section className="mt-6 grid gap-4 lg:grid-cols-[280px_1fr_360px]">
        <aside className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2">
            <PanelLeft size={18} className="text-blue-600" />
            <h2 className="font-semibold">Modules</h2>
          </div>
          <div className="mt-4 grid gap-2">
            {modules.map((module, index) => (
              <div key={module.id} className="rounded-md border p-3 text-sm opacity-100 data-[disabled=true]:opacity-50" data-disabled={!module.enabled}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{index + 1}. {module.label}</span>
                  <input aria-label={`${module.label} enabled`} type="checkbox" checked={module.enabled} onChange={() => toggleModule(module.id)} />
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                  <button type="button" onClick={() => moveModule(module.id, -1)} className="rounded border px-2 py-1">Up</button>
                  <button type="button" onClick={() => moveModule(module.id, 1)} className="rounded border px-2 py-1">Down</button>
                  <button type="button" onClick={() => copyText(`## ${module.label}`)} className="rounded border px-2 py-1">Copy</button>
                  <button type="button" onClick={() => deleteModule(module.id)} className="rounded border px-2 py-1">Delete</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-md border bg-slate-50 p-3">
            <h3 className="text-sm font-semibold">Module parameters</h3>
            <label className="mt-3 grid gap-1 text-xs text-slate-600">
              Card theme
              <select className="rounded border bg-white px-2 py-2" defaultValue={props.themeKey}>
                <option>github-native</option>
                <option>minimal-dark</option>
                <option>student-portfolio</option>
              </select>
            </label>
            <label className="mt-3 grid gap-1 text-xs text-slate-600">
              Max projects
              <input className="rounded border px-2 py-2" defaultValue="6" />
            </label>
          </div>
        </aside>
        <section className="grid gap-4">
          <article className="rounded-lg border bg-white p-4">
            <h2 className="font-semibold">Editor</h2>
            <textarea className="mt-3 min-h-44 w-full rounded-md border p-3 font-mono text-sm" value={markdown} onChange={(event) => setMarkdown(event.target.value)} />
          </article>
          <article className="rounded-lg border bg-white p-4">
            <h2 className="font-semibold">Live preview</h2>
            <div className={`mt-3 rounded-md border p-4 ${darkPreview ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-950"}`}>
              <h3 className="text-2xl font-semibold">{previewTitle(markdown)}</h3>
              <p className={`mt-2 ${darkPreview ? "text-slate-300" : "text-slate-600"}`}>{props.bio}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <span className="rounded-md border bg-white px-3 py-2 text-sm text-slate-950">{props.stats.contributions} contributions</span>
                <span className="rounded-md border bg-white px-3 py-2 text-sm text-slate-950">{props.stats.stars} stars</span>
                <span className="rounded-md border bg-white px-3 py-2 text-sm text-slate-950">{props.stats.forks} forks</span>
              </div>
            </div>
          </article>
          <article className="rounded-lg border bg-white p-4">
            <div className="flex items-center gap-2">
              <FileCode2 size={18} className="text-blue-600" />
              <h2 className="font-semibold">Markdown source</h2>
            </div>
            <pre className="mt-4 max-h-[360px] overflow-auto rounded-md border bg-slate-950 p-4 text-sm leading-6 text-slate-100">{markdown}</pre>
          </article>
        </section>
        <aside className="grid gap-4">
          <article className="rounded-lg border bg-white p-4">
            <h2 className="font-semibold">Structure view</h2>
            <ol className="mt-3 space-y-2 text-sm text-slate-600">
              {(headings.length > 0 ? headings : visibleModules.map((module) => `## ${module.label}`)).slice(0, 10).map((heading) => <li key={heading}>{heading}</li>)}
            </ol>
          </article>
          <article className="rounded-lg border bg-white p-4">
            <h2 className="font-semibold">Export</h2>
            <div className="mt-3 grid gap-2">
              <button type="button" onClick={() => copyText(markdown)} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><Clipboard size={16} /> Copy Markdown</button>
              <button type="button" onClick={downloadReadme} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><Download size={16} /> Download README.md</button>
              <button type="button" onClick={() => copyText(props.cardUrl)} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><Link2 size={16} /> Copy card URL</button>
              <button type="button" onClick={() => copyText(props.htmlSnippet)} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><Clipboard size={16} /> Copy HTML snippet</button>
            </div>
            <div className="mt-4 rounded-md border bg-slate-50 p-3 text-xs">
              <p className="font-medium">Card URL</p>
              <p className="mt-1 break-all text-slate-600">{props.cardUrl}</p>
              <p className="mt-3 font-medium">HTML</p>
              <p className="mt-1 break-all text-slate-600">{props.htmlSnippet}</p>
            </div>
          </article>
          <article className="rounded-lg border bg-white p-4">
            <h2 className="font-semibold">Deploy controls</h2>
            <div className="mt-3 grid gap-2">
              <button type="button" className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><History size={16} /> Preview diff</button>
              <button type="button" className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><Save size={16} /> Backup old README</button>
              <button type="button" className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><GitPullRequest size={16} /> Open PR</button>
              <button type="button" className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><RotateCcw size={16} /> Roll back</button>
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}

function extractHeadings(markdown: string): string[] {
  return markdown.split(/\r?\n/).filter((line) => /^#{1,3}\s+/.test(line)).slice(0, 20);
}

function previewTitle(markdown: string): string {
  const heading = markdown.split(/\r?\n/).find((line) => line.startsWith("# "));
  return heading?.replace(/^#\s+/, "").trim() || "README preview";
}
