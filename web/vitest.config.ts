import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Unit tests for the Data layer (services, api-client, adapters) and the pure
 * routing helpers. Node env + mocked `fetch` — no DOM, no network. The `@` alias
 * mirrors tsconfig so tests import exactly what the app imports.
 */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: { NEXT_PUBLIC_API_URL: "http://api.test" },
  },
});
