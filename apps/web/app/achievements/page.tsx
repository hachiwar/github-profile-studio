import { calculateAchievements, defaultAchievementRules } from "@gps/achievements";
import { demoGitHubDataset } from "@gps/core";

export default function AchievementsPage() {
  const result = calculateAchievements(demoGitHubDataset("octocat"), defaultAchievementRules, "en-US");

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-semibold">Achievement wall</h1>
      <p className="mt-2 text-slate-600">Configurable rules produce progress, rarity, scores, README badges, Pages walls, and share cards.</p>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {result.map((achievement) => (
          <article key={achievement.key} className="rounded-lg border bg-white p-4">
            <div className="text-2xl">{achievement.icon}</div>
            <h2 className="mt-3 font-semibold">{achievement.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{achievement.description}</p>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-blue-600" style={{ width: `${achievement.progress.percent}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">{achievement.progress.current}/{achievement.progress.target}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

