import { generateReadme } from "@gps/generators";
import { demoProfileConfig } from "@gps/core";

export default function ProfileReadmePage() {
  const generated = generateReadme(demoProfileConfig("new-developer", "en-US"));
  return (
    <main className="mx-auto grid max-w-7xl gap-4 px-4 py-8 lg:grid-cols-[280px_1fr_420px]">
      <aside className="rounded-lg border bg-white p-4">
        <h1 className="font-semibold">README modules</h1>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          {generated.modules.map((module) => (
            <li key={module.id} className="rounded-md border px-3 py-2">{module.label.en}</li>
          ))}
        </ul>
      </aside>
      <section className="rounded-lg border bg-white p-4">
        <h2 className="font-semibold">Markdown source</h2>
        <pre className="mt-4 max-h-[640px] overflow-auto text-sm leading-6">{generated.markdown}</pre>
      </section>
      <aside className="rounded-lg border bg-white p-4">
        <h2 className="font-semibold">Export</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">Copy, download, diff, submit, create PR, backup, and rollback actions are modeled here.</p>
      </aside>
    </main>
  );
}

