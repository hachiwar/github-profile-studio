import type { LocalizedText } from "./language";
export type StudioErrorCode = "USERNAME_INVALID" | "GITHUB_USER_NOT_FOUND" | "GITHUB_RATE_LIMITED" | "NETWORK_FAILED" | "REPOSITORY_NOT_FOUND" | "REPOSITORY_NOT_PUBLIC" | "README_NOT_FOUND" | "PAGES_NOT_ENABLED" | "OAUTH_FAILED" | "OAUTH_SCOPE_INSUFFICIENT" | "TOKEN_EXPIRED" | "COMMIT_CONFLICT" | "BRANCH_NOT_FOUND" | "WORKFLOW_WRITE_FAILED" | "THIRD_PARTY_CARD_INVALID" | "README_PARSE_FAILED" | "SVG_GENERATION_FAILED" | "HTML_GENERATION_FAILED" | "DOWNLOAD_FAILED" | "CACHE_STALE" | "AUTOMATION_FAILED";
export type StudioError = {
    code: StudioErrorCode;
    title: LocalizedText;
    reason: LocalizedText;
    impact: LocalizedText;
    solution: LocalizedText;
    retryable: boolean;
    docsPath: string;
};
export declare const studioErrors: Record<StudioErrorCode, StudioError>;
