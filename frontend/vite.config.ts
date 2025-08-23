import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { UserConfig } from "vite";
import type { InlineConfig } from "vitest";

// Extend Vite config with Vitest options
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: "./src/setupTests.ts",
    environment: "jsdom",
  },
} satisfies UserConfig & { test: InlineConfig });
