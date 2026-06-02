import { demoProfileConfig } from "@gps/core";
import { generatePagesSite } from "@gps/generators";
import { Clipboard, Download, Eye, FileArchive, Globe2, Monitor, Smartphone, Tablet } from "lucide-react";

export default function PagesWorkspacePage() {
  const config = demoProfileConfig("new-developer", "en-US");
  const site = generatePagesSite(config);
  const html = site.files["index.html"];
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
        <div>
          <p className="text-sm font-medium text-blue-600">Workspace / @{config.targetUsername}</p>
          <h1 className="mt-1 text-3xl font-semibold">GitHub Pages generator</h1>
          <p className="mt-2 text-slate-600">Current target type: GitHub Pages site. Static HTML, CSS, JS, data JSON, SEO, sitemap, and workflow files are generated together.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm"><Clipboard size={16} /> Copy HTML</button>
          <button className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm"><Download size={16} /> Download site</button>
          <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white"><Globe2 size={16} /> Deploy Pages</button>
        </div>
      </header>
      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_380px]">
        <article className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-blue-600" />
            <h2 className="font-semibold">Responsive preview</h2>
          </div>
          <div className="mt-4 rounded-md border bg-slate-50 p-4">
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2"><Smartphone size={16} /> Mobile</span>
              <span className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2"><Tablet size={16} /> Tablet</span>
              <span className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2"><Monitor size={16} /> Desktop</span>
            </div>
            <div className="mt-4 rounded-lg border bg-white p-5">
              <p className="text-sm font-semibold text-blue-600">{config.profile.currentRole}</p>
              <h3 className="mt-2 text-4xl font-semibold">{config.profile.displayName}</h3>
              <p className="mt-3 max-w-2xl text-slate-600">{config.profile.bio}</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-4">
                <span className="rounded-md border px-3 py-2 text-sm">{config.github?.repositories.length} repos</span>
                <span className="rounded-md border px-3 py-2 text-sm">{config.github?.totalStars} stars</span>
                <span className="rounded-md border px-3 py-2 text-sm">{config.github?.totalForks} forks</span>
                <span className="rounded-md border px-3 py-2 text-sm">{config.github?.technologyTags.length} skills</span>
              </div>
            </div>
          </div>
          <h2 className="mt-6 font-semibold">HTML source preview</h2>
          <pre className="mt-3 max-h-[360px] overflow-auto rounded-md border bg-slate-950 p-4 text-xs leading-6 text-slate-100">{html.slice(0, 3600)}</pre>
        </article>
        <aside className="grid gap-4">
          <article className="rounded-lg border bg-white p-4">
            <div className="flex items-center gap-2">
              <FileArchive size={18} className="text-blue-600" />
              <h2 className="font-semibold">Static package</h2>
            </div>
            <div className="mt-4 grid gap-2">
              {Object.entries(site.files).map(([name, content]) => (
                <div key={name} className="rounded-md border p-3">
                  <p className="font-medium">{name}</p>
                  <p className="mt-1 text-sm text-slate-600">{content.length.toLocaleString()} bytes</p>
                </div>
              ))}
            </div>
          </article>
          <article className="rounded-lg border bg-white p-4">
            <h2 className="font-semibold">Deploy controls</h2>
            <div className="mt-3 grid gap-2">
              <button className="rounded-md border px-3 py-2 text-left text-sm">Create username.github.io repository</button>
              <button className="rounded-md border px-3 py-2 text-left text-sm">Enable Pages from main / root</button>
              <button className="rounded-md border px-3 py-2 text-left text-sm">Preview diff before commit</button>
              <button className="rounded-md border px-3 py-2 text-left text-sm">Rollback previous site files</button>
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}
