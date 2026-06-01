export default function ExamplesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-semibold">Examples</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {["New developer", "Open source maintainer", "Job seeker"].map((item) => (
          <article key={item} className="rounded-lg border bg-white p-5">
            <h2 className="font-semibold">{item}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Example profiles will be backed by deterministic fixtures and Playwright snapshots.</p>
          </article>
        ))}
      </div>
    </main>
  );
}

