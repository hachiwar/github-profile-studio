import { z } from "zod";

export const localeSchema = z.enum(["en-US", "zh-CN", "bilingual"]);
export type StudioLocale = z.infer<typeof localeSchema>;

export type LocalizedText = {
  en: string;
  zh: string;
};

export function localize(text: LocalizedText, locale: StudioLocale): string {
  if (locale === "zh-CN") return text.zh;
  if (locale === "bilingual") return `${text.en}\n${text.zh}`;
  return text.en;
}

export function localeDate(value: Date | string, locale: StudioLocale): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const formatterLocale = locale === "zh-CN" ? "zh-CN" : "en-US";
  return new Intl.DateTimeFormat(formatterLocale, { dateStyle: "medium" }).format(date);
}

export function localeNumber(value: number, locale: StudioLocale): string {
  const formatterLocale = locale === "zh-CN" ? "zh-CN" : "en-US";
  return new Intl.NumberFormat(formatterLocale).format(value);
}

