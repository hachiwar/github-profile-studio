import { describe, expect, it } from "vitest";
import { evaluatePerformanceBudgets } from "./performance";

describe("performance budgets", () => {
  it("passes the current production route and SVG budgets", () => {
    const result = evaluatePerformanceBudgets([
      { surface: "homepage", route: "/", firstLoadJsKb: 106, routeSizeKb: 0.2 },
      { surface: "editor", route: "/dashboard/new-user", firstLoadJsKb: 134, routeSizeKb: 31.7 },
      { surface: "charts", route: "/cards", firstLoadJsKb: 103, routeSizeKb: 0.3 },
      { surface: "templates", route: "/templates", firstLoadJsKb: 103, routeSizeKb: 0.3 },
      { surface: "preview", route: "/dashboard/profile-readme", firstLoadJsKb: 106, routeSizeKb: 3.6 },
      { surface: "images", route: "/api/cards/stats?format=png", assetKb: 10.1 },
      { surface: "svg", route: "/api/cards/stats?format=svg", svgBytes: 1283 },
      { surface: "mobile", route: "/dashboard/profile-readme", firstLoadJsKb: 106, routeSizeKb: 3.6 }
    ]);

    expect(result.pass).toBe(true);
    expect(result.acceptanceIds).toContain("13-007");
    expect(result.checks).toHaveLength(14);
  });

  it("fails when a surface exceeds a budget", () => {
    const result = evaluatePerformanceBudgets([{ surface: "editor", route: "/dashboard/new-user", firstLoadJsKb: 220 }]);

    expect(result.pass).toBe(false);
    expect(result.checks[0]).toMatchObject({ metric: "firstLoadJsKb", actual: 220, limit: 160, pass: false });
  });
});
