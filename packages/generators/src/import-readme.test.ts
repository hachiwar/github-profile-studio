import { describe, expect, it } from "vitest";
import { detectThirdPartyCards, importReadmeMarkdown } from "./import-readme";

const sample = `# Hi

![stats](https://github-readme-stats.vercel.app/api?username=octocat&theme=dark)
![langs](https://github-readme-stats.vercel.app/api/top-langs/?username=octocat)
![views](https://komarev.com/ghpvc/?username=octocat)
<div align="center">custom html</div>
<!-- BLOG-POST-LIST:START -->
<!-- BLOG-POST-LIST:END -->
`;

describe("README import parser", () => {
  it("detects modules, third-party cards, suggestions, and custom content", () => {
    const result = importReadmeMarkdown(sample, "paste");
    expect(result.modules.some((module) => module.type === "github-stats")).toBe(true);
    expect(result.thirdPartyCards.some((card) => card.provider === "github-readme-stats")).toBe(true);
    expect(result.thirdPartyCards.some((card) => card.provider === "komarev-profile-views")).toBe(true);
    expect(result.preservedCustomContent.length).toBeGreaterThan(0);
    expect(result.suggestions.some((item) => item.code === "CARD_CONVERSION_AVAILABLE")).toBe(true);
    expect(result.formattedMarkdown).toContain("# Hi");
    expect(result.diff.some((item) => item.type === "added")).toBe(true);
    expect(result.exportFiles.some((file) => file.path === "README.optimized.md")).toBe(true);
  });

  it("recognizes supported third-party card providers", () => {
    const cards = detectThirdPartyCards(`
![streak](https://streak-stats.demolab.com?user=octocat)
![trophy](https://github-profile-trophy.vercel.app/?username=octocat)
![typing](https://readme-typing-svg.herokuapp.com?lines=Hello)
`);
    expect(cards.map((card) => card.provider)).toEqual([
      "github-readme-streak-stats",
      "github-profile-trophy",
      "typing-svg"
    ]);
  });
});
