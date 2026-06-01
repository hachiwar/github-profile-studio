import { z } from "zod";
import { builtinThemePresets, type ThemeDefinition } from "./templates";

export const themeExportSchema = z.object({
  schemaVersion: z.literal(1),
  exportedAt: z.string(),
  theme: z.object({
    key: z.string().min(1),
    name: z.object({ en: z.string().min(1), zh: z.string().min(1) }),
    category: z.string().min(1),
    tokens: z.object({
      primary: z.string().min(1),
      accent: z.string().min(1),
      background: z.string().min(1),
      foreground: z.string().min(1),
      border: z.string().min(1),
      fontFamily: z.string().min(1),
      radius: z.string().min(1),
      shadow: z.string(),
      density: z.enum(["compact", "comfortable", "spacious"]),
      animation: z.enum(["none", "subtle", "expressive"])
    })
  })
});

export type ThemeExport = z.infer<typeof themeExportSchema>;

export type ThemeImportResult = {
  valid: boolean;
  theme?: ThemeDefinition;
  errors: string[];
};

export function exportThemeJson(themeKey: string): ThemeExport {
  const theme = builtinThemePresets.find((item) => item.key === themeKey) ?? builtinThemePresets[0];
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    theme
  };
}

export function importThemeJson(value: unknown): ThemeImportResult {
  const parsed = themeExportSchema.safeParse(value);
  if (!parsed.success) {
    return {
      valid: false,
      errors: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    };
  }

  return {
    valid: true,
    theme: parsed.data.theme,
    errors: []
  };
}

export function buildThemeSharePayload(theme: ThemeDefinition): { shareId: string; payload: ThemeExport } {
  const payload: ThemeExport = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    theme
  };
  const shareId = stableHash(JSON.stringify({ key: theme.key, tokens: theme.tokens }));
  return { shareId, payload };
}

export function buildThemeShareLink(themeKey: string, appUrl: string): string {
  const theme = builtinThemePresets.find((item) => item.key === themeKey) ?? builtinThemePresets[0];
  const { shareId } = buildThemeSharePayload(theme);
  return `${appUrl.replace(/\/$/, "")}/templates?theme=${encodeURIComponent(theme.key)}&share=${shareId}`;
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
