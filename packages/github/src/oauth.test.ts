import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { buildGitHubOAuthUrl, createOAuthState, decryptToken, encryptToken, exchangeGitHubOAuthCode, parseOAuthState } from "./oauth";

describe("OAuth token encryption", () => {
  it("encrypts and decrypts tokens with AES-GCM", () => {
    const key = randomBytes(32).toString("base64");
    const encrypted = encryptToken("gho_example", key);
    expect(encrypted.ciphertext).not.toBe("gho_example");
    expect(decryptToken(encrypted, key)).toBe("gho_example");
  });

  it("creates parseable OAuth state and authorization URLs", () => {
    const state = createOAuthState("/dashboard", "nonce");
    expect(parseOAuthState(state)).toMatchObject({ nonce: "nonce", returnTo: "/dashboard" });
    const url = buildGitHubOAuthUrl({
      clientId: "client",
      redirectUri: "https://studio.example/api/oauth/github/callback",
      state
    });
    expect(url).toContain("github.com/login/oauth/authorize");
    expect(url).toContain("client_id=client");
    expect(url).toContain("scope=read%3Auser+public_repo+workflow");
  });

  it("exchanges an OAuth code with GitHub", async () => {
    const token = await exchangeGitHubOAuthCode(
      {
        clientId: "client",
        clientSecret: "secret",
        code: "code",
        redirectUri: "https://studio.example/api/oauth/github/callback"
      },
      async () =>
        new Response(JSON.stringify({ access_token: "gho_example", token_type: "bearer", scope: "read:user public_repo" }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
    );
    expect(token.access_token).toBe("gho_example");
    expect(token.scope).toContain("public_repo");
  });
});
