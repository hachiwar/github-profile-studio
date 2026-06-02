import { generateReadme } from "@gps/generators";
import { demoProfileConfig } from "@gps/core";
import { ReadmeWorkspace } from "../../../components/readme-workspace";

export default function ProfileReadmePage() {
  const config = demoProfileConfig("new-developer", "en-US");
  const generated = generateReadme(config);
  const cardUrl = `https://github-profile-studio.vercel.app/api/cards/stats?user=${config.targetUsername}&locale=en-US&theme=${config.themeKey}`;
  const htmlSnippet = `<img src="${cardUrl}&format=svg" alt="${config.targetUsername} GitHub stats" />`;
  return (
    <ReadmeWorkspace
      username={config.targetUsername}
      themeKey={config.themeKey}
      initialMarkdown={generated.markdown}
      modules={generated.modules.map((module) => ({ id: module.id, label: module.label.en }))}
      stats={{
        contributions: config.github?.contributions.totalContributions ?? 0,
        stars: config.github?.totalStars ?? 0,
        forks: config.github?.totalForks ?? 0
      }}
      bio={config.profile.bio ?? "Building in public."}
      cardUrl={cardUrl}
      htmlSnippet={htmlSnippet}
    />
  );
}
