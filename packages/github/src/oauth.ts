import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

export type EncryptedToken = {
  algorithm: "aes-256-gcm";
  iv: string;
  authTag: string;
  ciphertext: string;
};

export type GitHubOAuthState = {
  nonce: string;
  returnTo: string;
  createdAt: string;
};

export type GitHubOAuthTokenResponse = {
  access_token: string;
  token_type: string;
  scope: string;
};

export const minimumOAuthScopes = [
  {
    scope: "read:user",
    reason: "Identify the signed-in GitHub user."
  },
  {
    scope: "public_repo",
    reason: "Create and update public username and username.github.io repositories."
  },
  {
    scope: "workflow",
    reason: "Create or update GitHub Actions workflow files when the user enables automation."
  }
];

export function createOAuthState(returnTo = "/dashboard", nonce = randomBytes(16).toString("hex")): string {
  const state: GitHubOAuthState = {
    nonce,
    returnTo,
    createdAt: new Date().toISOString()
  };
  return Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
}

export function parseOAuthState(value: string): GitHubOAuthState {
  const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as GitHubOAuthState;
  if (!parsed.nonce || !parsed.returnTo || !parsed.createdAt) throw new Error("OAUTH_STATE_INVALID");
  return parsed;
}

export function buildGitHubOAuthUrl(input: {
  clientId: string;
  redirectUri: string;
  state: string;
  scopes?: string[];
}): string {
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("scope", (input.scopes ?? minimumOAuthScopes.map((item) => item.scope)).join(" "));
  url.searchParams.set("state", input.state);
  return url.toString();
}

export async function exchangeGitHubOAuthCode(
  input: {
    clientId: string;
    clientSecret: string;
    code: string;
    redirectUri: string;
  },
  fetcher: typeof fetch = fetch
): Promise<GitHubOAuthTokenResponse> {
  const response = await fetcher("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: input.clientId,
      client_secret: input.clientSecret,
      code: input.code,
      redirect_uri: input.redirectUri
    })
  });
  const body = (await response.json()) as Partial<GitHubOAuthTokenResponse> & { error?: string };
  if (!response.ok || body.error || !body.access_token) throw new Error(body.error ?? "OAUTH_TOKEN_EXCHANGE_FAILED");
  return {
    access_token: body.access_token,
    token_type: body.token_type ?? "bearer",
    scope: body.scope ?? ""
  };
}

export function encryptToken(token: string, base64Key: string): EncryptedToken {
  const key = Buffer.from(base64Key, "base64");
  if (key.length !== 32) throw new Error("TOKEN_KEY_INVALID");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return {
    algorithm: "aes-256-gcm",
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64")
  };
}

export function decryptToken(encrypted: EncryptedToken, base64Key: string): string {
  const key = Buffer.from(base64Key, "base64");
  if (key.length !== 32) throw new Error("TOKEN_KEY_INVALID");
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(encrypted.iv, "base64"));
  decipher.setAuthTag(Buffer.from(encrypted.authTag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted.ciphertext, "base64")),
    decipher.final()
  ]).toString("utf8");
}
