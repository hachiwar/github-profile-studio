import { generateReadme, generatePagesSite } from "@gps/generators";
import { demoProfileConfig } from "@gps/core";

export default async function GeneratePage({
  searchParams
}: {
  searchParams?: Promise<{ username?: string; locale?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const username = resolvedSearchParams?.username || "new-developer";
  const locale = resolvedSearchParams?.locale === "zh-CN" ? "zh-CN" : "en-US";
  const config = demoProfileConfig(username, locale);
  const readme = generateReadme(config);
  const site = generatePagesSite(config);

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[340px_1fr]">
      <aside className="space-y-4 rounded-lg border bg-white p-5">
        <div>
          <h1 className="text-2xl font-semibold">Quick generator</h1>
          <p className="mt-2 text-sm text-slate-600">
            This workspace starts with a deterministic generator so every acceptance item can be tested.
          </p>
        </div>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-medium">Username</dt>
            <dd className="text-slate-600">{username}</dd>
          </div>
          <div>
            <dt className="font-medium">Locale</dt>
            <dd className="text-slate-600">{locale}</dd>
          </div>
          <div>
            <dt className="font-medium">Mode</dt>
            <dd className="text-slate-600">{config.mode}</dd>
          </div>
        </dl>
      </aside>
      <section className="grid gap-6">
        <article className="rounded-lg border bg-white">
          <header className="border-b p-4">
            <h2 className="font-semibold">README.md preview</h2>
          </header>
          <pre className="max-h-[520px] overflow-auto p-4 text-sm leading-6">{readme.markdown}</pre>
        </article>
        <article className="rounded-lg border bg-white">
          <header className="border-b p-4">
            <h2 className="font-semibold">GitHub Pages output</h2>
          </header>
          <div className="grid gap-3 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {Object.keys(site.files).map((file) => (
              <span key={file} className="rounded-md border px-3 py-2">
                {file}
              </span>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
