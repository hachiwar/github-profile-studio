import type { PrivacySetting, ProfileStudioConfig } from "./domain";
export declare const defaultPrivacySettings: PrivacySetting[];
export type PrivacyCheck = {
    field: string;
    severity: "info" | "warning" | "critical";
    message: string;
    scope: "readme" | "pages";
};
export declare function runPrivacyCheck(config: ProfileStudioConfig): PrivacyCheck[];
export declare function hideSensitiveSettings(config: ProfileStudioConfig): ProfileStudioConfig;
