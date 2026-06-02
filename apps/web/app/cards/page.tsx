import { cardCatalog, renderCardSvg } from "@gps/cards";
import { demoGitHubDataset } from "@gps/core";
import { Clipboard, Download, Eye, SlidersHorizontal } from "lucide-react";

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
      <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-semibold">Dynamic cards</h1>
          <p className="mt-2 text-slate-600">Cards support SVG, PNG, JSON, Markdown, HTML, iframe, and OG image output.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm"><Clipboard size={16} /> Copy URL</button>
          <button className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm"><Download size={16} /> Download SVG</button>
        </div>
      </header>
      <section className="mt-8 grid gap-4 lg:grid-cols-[280px_1fr_420px]">
        <aside className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-blue-600" />
            <h2 className="font-semibold">Parameters</h2>
          </div>
          <div className="mt-4 grid gap-3 text-sm">
            <label className="grid gap-1">
              Card type
              <select className="rounded-md border px-3 py-2">
                {cardCatalog.map((card) => <option key={card.type}>{card.type}</option>)}
              </select>
            </label>
            <label className="grid gap-1">
              Locale
              <select className="rounded-md border px-3 py-2">
                <option>en-US</option>
                <option>zh-CN</option>
                <option>bilingual</option>
              </select>
            </label>
            <label className="grid gap-1">
              Theme
              <select className="rounded-md border px-3 py-2">
                <option>github-native</option>
                <option>minimal-dark</option>
                <option>student-portfolio</option>
              </select>
            </label>
            <label className="grid gap-1">
              Width
              <input className="rounded-md border px-3 py-2" defaultValue="720" />
            </label>
            <label className="grid gap-1">
              Height
              <input className="rounded-md border px-3 py-2" defaultValue="260" />
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked /> Show icons
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Hide border
            </label>
          </div>
        </aside>
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
          <div className="mb-4 flex items-center gap-2">
            <Eye size={18} className="text-blue-600" />
            <h2 className="font-semibold">Profile overview preview</h2>
          </div>
          <div dangerouslySetInnerHTML={{ __html: svg }} />
          <div className="mt-4 rounded-md border bg-slate-50 p-3 text-xs">
            <p className="font-medium">Markdown</p>
            <p className="mt-1 break-all text-slate-600">![stats](https://github-profile-studio.vercel.app/api/cards/stats?user=octocat&locale=en-US&format=svg)</p>
            <p className="mt-3 font-medium">HTML</p>
            <p className="mt-1 break-all text-slate-600">&lt;img src=&quot;https://github-profile-studio.vercel.app/api/cards/stats?user=octocat&quot; alt=&quot;GitHub stats&quot; /&gt;</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
