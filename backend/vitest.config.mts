import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["./tests/setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 30000,
    hookTimeout: 180000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.d.ts", "src/models/SavedPost.ts"],
    },
  },
});
