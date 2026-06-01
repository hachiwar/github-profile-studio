export default function ImportPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-semibold">README import and optimization</h1>
      <p className="mt-3 text-slate-600">
        Paste Markdown, upload README.md content through the API, or import from a repository URL. The parser detects known modules, third-party card URLs, custom HTML, images, tables, comments, and GitHub Actions markers while preserving unmatched content.
      </p>
      <textarea className="mt-6 min-h-80 w-full rounded-lg border p-4" placeholder="Paste README Markdown or a repository URL..." />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {["Module detection", "Third-party card conversion", "Theme and structure suggestions"].map((item) => (
          <div key={item} className="rounded-lg border bg-white p-4 text-sm font-medium">
            {item}
          </div>
        ))}
      </div>
    </main>
  );
}
