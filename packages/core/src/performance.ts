export type PerformanceSurface =
  | "homepage"
  | "editor"
  | "charts"
  | "templates"
  | "preview"
  | "images"
  | "svg"
  | "mobile";

export type PerformanceBudget = {
  surface: PerformanceSurface;
  maxFirstLoadJsKb?: number;
  maxRouteSizeKb?: number;
  maxAssetKb?: number;
  maxSvgBytes?: number;
};

export type PerformanceSnapshot = {
  surface: PerformanceSurface;
  route?: string;
  firstLoadJsKb?: number;
  routeSizeKb?: number;
  assetKb?: number;
  svgBytes?: number;
};

export type PerformanceBudgetResult = {
  pass: boolean;
  acceptanceIds: string[];
  checks: Array<{
    surface: PerformanceSurface;
    route?: string;
    metric: "firstLoadJsKb" | "routeSizeKb" | "assetKb" | "svgBytes";
    actual: number;
    limit: number;
    pass: boolean;
  }>;
};

export const defaultPerformanceBudgets: PerformanceBudget[] = [
  { surface: "homepage", maxFirstLoadJsKb: 140, maxRouteSizeKb: 10 },
  { surface: "editor", maxFirstLoadJsKb: 160, maxRouteSizeKb: 50 },
  { surface: "charts", maxFirstLoadJsKb: 140, maxRouteSizeKb: 15 },
  { surface: "templates", maxFirstLoadJsKb: 140, maxRouteSizeKb: 15 },
  { surface: "preview", maxFirstLoadJsKb: 160, maxRouteSizeKb: 50 },
  { surface: "images", maxAssetKb: 320 },
  { surface: "svg", maxSvgBytes: 100_000 },
  { surface: "mobile", maxFirstLoadJsKb: 160, maxRouteSizeKb: 50 }
];

export const performanceAcceptanceIds = ["13-007"] as const;

export function evaluatePerformanceBudgets(
  snapshots: PerformanceSnapshot[],
  budgets: PerformanceBudget[] = defaultPerformanceBudgets
): PerformanceBudgetResult {
  const budgetBySurface = new Map(budgets.map((budget) => [budget.surface, budget]));
  const checks = snapshots.flatMap((snapshot) => {
    const budget = budgetBySurface.get(snapshot.surface);
    if (!budget) return [];
    return [
      checkMetric(snapshot, "firstLoadJsKb", snapshot.firstLoadJsKb, budget.maxFirstLoadJsKb),
      checkMetric(snapshot, "routeSizeKb", snapshot.routeSizeKb, budget.maxRouteSizeKb),
      checkMetric(snapshot, "assetKb", snapshot.assetKb, budget.maxAssetKb),
      checkMetric(snapshot, "svgBytes", snapshot.svgBytes, budget.maxSvgBytes)
    ].filter((item): item is PerformanceBudgetResult["checks"][number] => Boolean(item));
  });

  return {
    pass: checks.every((check) => check.pass),
    acceptanceIds: [...performanceAcceptanceIds],
    checks
  };
}

function checkMetric(
  snapshot: PerformanceSnapshot,
  metric: PerformanceBudgetResult["checks"][number]["metric"],
  actual: number | undefined,
  limit: number | undefined
): PerformanceBudgetResult["checks"][number] | undefined {
  if (actual === undefined || limit === undefined) return undefined;
  return {
    surface: snapshot.surface,
    route: snapshot.route,
    metric,
    actual,
    limit,
    pass: actual <= limit
  };
}
