import { describe, expect, it } from "vitest";
import { parseGitHubInput } from "./parse";

describe("parseGitHubInput", () => {
  it("parses a username", () => {
    expect(parseGitHubInput("octocat")).toEqual({ kind: "username", username: "octocat" });
  });

  it("parses a profile URL", () => {
    expect(parseGitHubInput("https://github.com/vercel")).toEqual({ kind: "profile-url", username: "vercel" });
  });

  it("parses a repository URL", () => {
    expect(parseGitHubInput("https://github.com/vercel/next.js")).toEqual({
      kind: "repo-url",
      username: "vercel",
      repo: "next.js"
    });
  });

  it("rejects invalid input", () => {
    expect(() => parseGitHubInput("https://example.com/nope")).toThrow("USERNAME_INVALID");
  });
});

