import { describe, expect, it } from "vitest";
import { buildCardEmbeds } from "./embeds";

describe("buildCardEmbeds", () => {
  it("creates markdown, html, iframe, and url variants", () => {
    const embeds = buildCardEmbeds(
      { type: "profile-overview", user: "octocat", locale: "en-US", theme: "github-native" },
      "https://studio.example"
    );
    expect(embeds.url).toContain("/api/cards/profile-overview");
    expect(embeds.markdown).toContain("![profile-overview]");
    expect(embeds.html).toContain("<img");
    expect(embeds.iframe).toContain("<iframe");
  });
});

