/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: { outDir: "dist", chunkSizeWarningLimit: 4000 },
  server: { port: 5173, host: true },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
