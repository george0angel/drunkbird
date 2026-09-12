import { defineConfig } from "vite";
import { globSync } from "glob";

export default defineConfig({
  base: process.env.SITE_BASE || "/",
  build: {
    rollupOptions: {
      input: globSync("**/index.html", {
        ignore: ["node_modules/**", "dist/**", "build/**"],
      }),
    },
  },
});
