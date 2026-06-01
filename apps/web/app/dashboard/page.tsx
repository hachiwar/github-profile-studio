import Link from "next/link";

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

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-semibold">Workspace</h1>
      <p className="mt-2 text-slate-600">Configure, preview, export, deploy, and rollback generated profile assets.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {dashboardItems.map(([label, href]) => (
          <Link key={href} href={href} className="rounded-lg border bg-white p-5 hover:bg-muted">
            <h2 className="font-semibold">{label}</h2>
            <p className="mt-2 text-sm text-slate-600">Open {label.toLowerCase()} workspace.</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
