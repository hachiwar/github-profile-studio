import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts"],
    coverage: {
      reporter: ["text", "json", "html"]
    }
  },
  resolve: {
    alias: {
      "@gps/core": new URL("./packages/core/src/index.ts", import.meta.url).pathname,
      "@gps/github": new URL("./packages/github/src/index.ts", import.meta.url).pathname,
      "@gps/generators": new URL("./packages/generators/src/index.ts", import.meta.url).pathname,
      "@gps/cards": new URL("./packages/cards/src/index.ts", import.meta.url).pathname,
      "@gps/achievements": new URL("./packages/achievements/src/index.ts", import.meta.url).pathname
    }
  }
});

