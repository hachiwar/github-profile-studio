import { cardCatalog, renderCardSvg } from "@gps/cards";
import { demoGitHubDataset } from "@gps/core";

export default function CardsPage() {
  const dataset = demoGitHubDataset("octocat");
  const svg = renderCardSvg({
    type: "profile-overview",
    locale: "en-US",
    user: dataset.profile.githubUsername,
    dataset,
    theme: "github-native",
    format: "svg"
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-semibold">Dynamic cards</h1>
      <p className="mt-2 text-slate-600">Cards support SVG, PNG, JSON, Markdown, HTML, iframe, and OG image output.</p>
      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_420px]">
        <div className="grid gap-3 sm:grid-cols-2">
          {cardCatalog.map((card) => (
            <article key={card.type} className="rounded-lg border bg-white p-4">
              <h2 className="font-semibold">{card.name.en}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.description.en}</p>
              <p className="mt-3 text-xs text-slate-500">{card.acceptanceId}</p>
            </article>
          ))}
        </div>
        <aside className="rounded-lg border bg-white p-4">
          <h2 className="mb-4 font-semibold">Profile overview preview</h2>
          <div dangerouslySetInnerHTML={{ __html: svg }} />
        </aside>
      </section>
    </main>
  );
}

