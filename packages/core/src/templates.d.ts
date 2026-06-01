import type { GenerationMode } from "./domain";
import type { LocalizedText } from "./language";
export type TemplateDefinition = {
    key: string;
    type: "readme" | "pages" | "card" | "achievement" | "portfolio" | "resume" | "dashboard" | "social-card" | "year-in-review" | "custom";
    name: LocalizedText;
    description: LocalizedText;
    recommendedModes: GenerationMode[];
    acceptanceIds: string[];
};
export type ThemeDefinition = {
    key: string;
    name: LocalizedText;
    category: string;
    tokens: {
        primary: string;
        accent: string;
        background: string;
        foreground: string;
        border: string;
        fontFamily: string;
        radius: string;
        shadow: string;
        density: "compact" | "comfortable" | "spacious";
        animation: "none" | "subtle" | "expressive";
    };
};
export declare const generationModes: readonly [{
    readonly key: "new-user";
    readonly label: {
        readonly en: "New-user automation";
        readonly zh: "新用户自动化模式";
    };
}, {
    readonly key: "data-enhanced";
    readonly label: {
        readonly en: "Data-enhanced";
        readonly zh: "数据增强模式";
    };
}, {
    readonly key: "hybrid";
    readonly label: {
        readonly en: "Hybrid";
        readonly zh: "混合模式";
    };
}, {
    readonly key: "manual";
    readonly label: {
        readonly en: "Manual selection";
        readonly zh: "手动选择模式";
    };
}];
export declare const builtinReadmeTemplates: TemplateDefinition[];
export declare const builtinPageTemplates: TemplateDefinition[];
export declare const builtinThemePresets: ThemeDefinition[];
