import { Check, Database, Github, Server } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const plans = [
  {
    name: "Open Source",
    price: "$0",
    description: "Generate, export, and self-host README, Pages, cards, achievements, and workflows.",
    items: ["Unlimited local generation", "README and Pages ZIP export", "Public dynamic card API", "GitHub Actions workflow export"]
  },
  {
    name: "Hosted Studio",
    price: "Usage based",
    description: "Vercel, PostgreSQL, Redis, and GitHub API costs for a hosted deployment.",
    items: ["OAuth login and saved configs", "Card cache and worker queues", "Snapshot history", "Deployment logs and rollback records"]
  },
  {
    name: "Team / Enterprise",
    price: "Custom",
    description: "Private templates, admin controls, audit logs, and controlled rollout for organizations.",
    items: ["Template governance", "Abuse monitoring", "SAML-ready architecture", "Custom compliance review"]
  }
];

const costs: Array<[string, string, LucideIcon]> = [
  ["Vercel", "Next.js web app, API routes, and static assets", Server],
  ["PostgreSQL", "OAuth accounts, saved configs, snapshots, generated profiles, and logs", Database],
  ["Redis", "GitHub API cache, card cache, queues, and rate-limit coordination", Server],
  ["GitHub", "OAuth, repository writes, Pages setup, Actions workflows, and public data APIs", Github]
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Pricing</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Open-source first, deployment-cost aware.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          GitHub Profile Studio is built as a complete product that can be self-hosted. The hosted
          version tracks infrastructure costs separately from the generator feature set, so users can
          still export everything without a paid account.
        </p>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.name} className="rounded-lg border bg-white p-6">
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="mt-2 text-3xl font-semibold">{plan.price}</p>
            <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600">{plan.description}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {plan.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-green-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="mt-12 border-t pt-10">
        <h2 className="text-2xl font-semibold">Deployment Cost Inputs</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {costs.map(([name, body, Icon]) => (
            <article key={String(name)} className="flex gap-4 rounded-lg border bg-white p-5">
              <Icon className="mt-1 h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold">{name}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
