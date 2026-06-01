import { demoProfileConfig } from "@gps/core";
import { generatePagesSite } from "@gps/generators";

export default function PagesWorkspacePage() {
  const site = generatePagesSite(demoProfileConfig("new-developer", "en-US"));
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-semibold">GitHub Pages generator</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(site.files).map(([name, content]) => (
          <article key={name} className="rounded-lg border bg-white p-4">
            <h2 className="font-semibold">{name}</h2>
            <p className="mt-2 text-sm text-slate-600">{content.length.toLocaleString()} bytes</p>
          </article>
        ))}
      </div>
    </main>
  );
}

