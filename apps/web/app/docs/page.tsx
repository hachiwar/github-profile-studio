export default function DocsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-semibold">Documentation</h1>
      <div className="mt-6 space-y-5 text-slate-700">
        <p>GitHub Profile Studio is organized around four output targets: README, Pages, cards, and achievements.</p>
        <p>All generated output supports English by default, Chinese as an option, and bilingual mode for README and Pages.</p>
        <p>Logged-out users can generate and export public-data output. GitHub OAuth unlocks repository creation, direct commits, pull requests, Actions, history, and rollback.</p>
      </div>
    </main>
  );
}

