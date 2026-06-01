import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { decryptToken, encryptToken } from "./oauth";

describe("OAuth token encryption", () => {
  it("encrypts and decrypts tokens with AES-GCM", () => {
    const key = randomBytes(32).toString("base64");
    const encrypted = encryptToken("gho_example", key);
    expect(encrypted.ciphertext).not.toBe("gho_example");
    expect(decryptToken(encrypted, key)).toBe("gho_example");
  });
});

