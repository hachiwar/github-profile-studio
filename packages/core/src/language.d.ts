import { z } from "zod";
export declare const localeSchema: z.ZodEnum<["en-US", "zh-CN", "bilingual"]>;
export type StudioLocale = z.infer<typeof localeSchema>;
export type LocalizedText = {
    en: string;
    zh: string;
};
export declare function localize(text: LocalizedText, locale: StudioLocale): string;
export declare function localeDate(value: Date | string, locale: StudioLocale): string;
export declare function localeNumber(value: number, locale: StudioLocale): string;
