import Link from "next/link";
import { BadgeCheck, Eye, FileText, Github, Layers, Settings, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const dashboardItems = [
  ["New-user automation", "/dashboard/new-user"],
  ["Profile README", "/dashboard/profile-readme"],
  ["GitHub Pages", "/dashboard/pages"],
  ["Cards", "/dashboard/cards"],
  ["Achievements", "/dashboard/achievements"],
  ["Import", "/dashboard/import"],
  ["Settings", "/dashboard/settings"],
  ["History", "/dashboard/history"]
];

const previewItems: Array<[string, string, LucideIcon]> = [
  ["README preview", "Generated Markdown and profile-like preview.", FileText],
  ["GitHub Profile", "Username repository output and card embeds.", Github],
  ["Pages preview", "Static site bundle, SEO, and responsive sections.", Eye],
  ["Export center", "Copy Markdown, HTML, card URLs, and site package.", Layers]
];

export default function DashboardPage() {
  const username = "new-developer";
  const targetType = "Profile README";
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="border-b pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Workspace</h1>
            <p className="mt-2 text-slate-600">Configure, preview, export, deploy, and rollback generated profile assets.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-md border bg-white px-3 py-2">@{username}</span>
            <span className="rounded-md border bg-white px-3 py-2">{targetType}</span>
            <span className="rounded-md border bg-white px-3 py-2">English</span>
          </div>
        </div>
        <nav className="mt-5 flex flex-wrap gap-2 text-sm font-medium">
          <Link className="rounded-md border bg-white px-3 py-2 hover:bg-slate-50" href="/dashboard/profile-readme">README</Link>
          <Link className="rounded-md border bg-white px-3 py-2 hover:bg-slate-50" href="/dashboard/pages">Pages</Link>
          <Link className="rounded-md border bg-white px-3 py-2 hover:bg-slate-50" href="/dashboard/cards">Cards</Link>
          <Link className="rounded-md border bg-white px-3 py-2 hover:bg-slate-50" href="/dashboard/achievements">Achievements</Link>
          <Link className="rounded-md border bg-white px-3 py-2 hover:bg-slate-50" href="/dashboard/settings">Settings</Link>
        </nav>
      </header>
      <section className="mt-6 grid gap-3 lg:grid-cols-4">
        {previewItems.map(([title, body, Icon]) => (
          <article key={String(title)} className="rounded-lg border bg-white p-4">
            <Icon className="mb-3 text-blue-600" size={22} />
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
          </article>
        ))}
      </section>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {dashboardItems.map(([label, href]) => (
          <Link key={href} href={href} className="rounded-lg border bg-white p-5 hover:bg-muted">
            <h2 className="font-semibold">{label}</h2>
            <p className="mt-2 text-sm text-slate-600">Open {label.toLowerCase()} workspace.</p>
          </Link>
        ))}
      </div>
      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <article className="rounded-lg border bg-white p-5">
          <BadgeCheck className="mb-3 text-blue-600" size={22} />
          <h2 className="font-semibold">Acceptance trace</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Each generated target is tied to requirements, evidence, and verification commands.</p>
        </article>
        <article className="rounded-lg border bg-white p-5">
          <Settings className="mb-3 text-blue-600" size={22} />
          <h2 className="font-semibold">Current target</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">@{username} / {targetType} / github-native theme / en-US locale.</p>
        </article>
        <article className="rounded-lg border bg-white p-5">
          <Sparkles className="mb-3 text-blue-600" size={22} />
          <h2 className="font-semibold">Next publish action</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Review diff, create backup, then commit directly or open a pull request.</p>
        </article>
      </section>
    </main>
  );
}
