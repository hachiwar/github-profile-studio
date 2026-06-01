import { z } from "zod";
export const localeSchema = z.enum(["en-US", "zh-CN", "bilingual"]);
export function localize(text, locale) {
    if (locale === "zh-CN")
        return text.zh;
    if (locale === "bilingual")
        return `${text.en}\n${text.zh}`;
    return text.en;
}
export function localeDate(value, locale) {
    const date = typeof value === "string" ? new Date(value) : value;
    const formatterLocale = locale === "zh-CN" ? "zh-CN" : "en-US";
    return new Intl.DateTimeFormat(formatterLocale, { dateStyle: "medium" }).format(date);
}
export function localeNumber(value, locale) {
    const formatterLocale = locale === "zh-CN" ? "zh-CN" : "en-US";
    return new Intl.NumberFormat(formatterLocale).format(value);
}
