import { defineConfig } from "vite";

export default defineConfig({
  base: "./", // CRITICAL: Must be relative path for embedded assets
  server: {
    port: 8080,
    open: false,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
