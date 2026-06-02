import { describe, expect, it } from "vitest";
import { studioErrors, type StudioErrorCode } from "./errors";

const requiredErrorCodes: StudioErrorCode[] = [
  "USERNAME_INVALID",
  "GITHUB_USER_NOT_FOUND",
  "GITHUB_RATE_LIMITED",
  "NETWORK_FAILED",
  "REPOSITORY_NOT_FOUND",
  "REPOSITORY_NOT_PUBLIC",
  "README_NOT_FOUND",
  "PAGES_NOT_ENABLED",
  "OAUTH_FAILED",
  "OAUTH_SCOPE_INSUFFICIENT",
  "TOKEN_EXPIRED",
  "COMMIT_CONFLICT",
  "BRANCH_NOT_FOUND",
  "WORKFLOW_WRITE_FAILED",
  "THIRD_PARTY_CARD_INVALID",
  "README_PARSE_FAILED",
  "SVG_GENERATION_FAILED",
  "HTML_GENERATION_FAILED",
  "DOWNLOAD_FAILED",
  "CACHE_STALE",
  "AUTOMATION_FAILED"
];

describe("studio error catalog", () => {
  it("provides localized guidance for every required failure scenario", () => {
    for (const code of requiredErrorCodes) {
      const error = studioErrors[code];
      expect(error.code).toBe(code);
      expect(error.title.en).toBeTruthy();
      expect(error.title.zh).toBeTruthy();
      expect(error.reason.en).toBeTruthy();
      expect(error.solution.en).toBeTruthy();
      expect(error.docsPath).toMatch(/^\/docs/);
    }
  });
});
