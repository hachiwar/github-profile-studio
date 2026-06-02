import { describe, expect, it } from "vitest";
import { demoGitHubDataset } from "@gps/core";
import { cardCatalog, renderCardSvg, resolveCardDefinition } from "./index";

describe("card rendering", () => {
  it("supports common card aliases", () => {
    expect(resolveCardDefinition("stats")?.type).toBe("github-stats");
    expect(resolveCardDefinition("streak")?.type).toBe("github-streak");
    expect(resolveCardDefinition("languages")?.type).toBe("top-languages");
    expect(resolveCardDefinition("repo")?.type).toBe("repository");
  });

  it("renders custom dimensions, colors, hidden border, and selected stats", () => {
    const svg = renderCardSvg({
      type: "stats",
      user: "octocat",
      locale: "en-US",
      dataset: demoGitHubDataset("octocat"),
      theme: "github-native",
      format: "svg",
      width: 720,
      height: 260,
      hideBorder: true,
      bgColor: "#f8fafc",
      titleColor: "#111827",
      include: ["stars", "forks"],
      showIcons: false
    });

    expect(svg).toContain('width="720"');
    expect(svg).toContain('height="260"');
    expect(svg).toContain('fill="#f8fafc"');
    expect(svg).toContain("Stars");
    expect(svg).toContain("Forks");
    expect(svg).not.toContain("Repositories");
    expect(svg).not.toContain("stroke=\"#d0d7de\"");
  });

  it("renders every catalog card type with an acceptance id", () => {
    for (const card of cardCatalog) {
      const svg = renderCardSvg({
        type: card.type,
        user: "octocat",
        locale: "en-US",
        dataset: demoGitHubDataset("octocat"),
        theme: "github-native",
        format: "svg"
      });
      expect(card.acceptanceId).toMatch(/^06-\d{3}$/);
      expect(svg).toContain("<svg");
      expect(svg).toContain(card.name.en);
    }
  });
});
