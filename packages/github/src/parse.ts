export type ParsedGitHubInput =
  | { kind: "username"; username: string }
  | { kind: "profile-url"; username: string }
  | { kind: "repo-url"; username: string; repo: string };

const usernamePattern = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;

export function parseGitHubInput(input: string): ParsedGitHubInput {
  const raw = input.trim();
  if (!raw) throw new Error("USERNAME_INVALID");

  const normalized = raw.replace(/^@/, "");
  if (usernamePattern.test(normalized)) {
    return { kind: "username", username: normalized };
  }

  const url = safeUrl(raw);
  if (!url || url.hostname.toLowerCase() !== "github.com") {
    throw new Error("USERNAME_INVALID");
  }

  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length === 1 && usernamePattern.test(segments[0])) {
    return { kind: "profile-url", username: segments[0] };
  }

  if (segments.length >= 2 && usernamePattern.test(segments[0])) {
    return { kind: "repo-url", username: segments[0], repo: segments[1].replace(/\.git$/, "") };
  }

  throw new Error("USERNAME_INVALID");
}

function safeUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    try {
      return new URL(`https://${value}`);
    } catch {
      return null;
    }
  }
}

