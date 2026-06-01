import { builtinPageTemplates, builtinReadmeTemplates, builtinThemePresets } from "@gps/core";

export default function TemplatesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-semibold">Template gallery</h1>
      <p className="mt-2 text-slate-600">
        README, GitHub Pages, card, achievement, portfolio, resume, dashboard, and social card templates share one theme system.
      </p>
      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {[...builtinReadmeTemplates, ...builtinPageTemplates].map((template) => (
          <article key={template.key} className="rounded-lg border bg-white p-5">
            <p className="text-xs font-semibold uppercase text-blue-600">{template.type}</p>
            <h2 className="mt-2 font-semibold">{template.name.en}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{template.description.en}</p>
            <p className="mt-4 text-xs text-slate-500">Acceptance: {template.acceptanceIds.join(", ")}</p>
          </article>
        ))}
      </section>
      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Theme presets</h2>
        <p className="mt-2 text-slate-600">
          Every theme can be exported as JSON, imported back into the editor, and shared through a stable link.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {builtinThemePresets.map((theme) => (
            <div key={theme.key} className="rounded-lg border bg-white p-4">
              <div className="flex gap-2">
                <span className="h-5 w-5 rounded-full" style={{ backgroundColor: theme.tokens.primary }} />
                <span className="h-5 w-5 rounded-full" style={{ backgroundColor: theme.tokens.accent }} />
                <span className="h-5 w-5 rounded-full border" style={{ backgroundColor: theme.tokens.background }} />
              </div>
              <p className="mt-3 text-sm font-medium">{theme.name.en}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
