import { defineConfig } from "vite";
import { globSync } from "glob";

import { layoutPlugin } from "./plugins/layout.js";

export default defineConfig({
  base: process.env.SITE_BASE || "/",
  plugins: [layoutPlugin()],
  build: {
    rollupOptions: {
      input: globSync("**/index.html", {
        ignore: ["node_modules/**", "dist/**", "build/**"],
      }),
    },
  },
});
