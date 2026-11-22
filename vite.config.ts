import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "carlink-static-scrollbar",
      load(id) {
        // Ant 6.7.1's precompiled CSS already contains default token variables.
        // zeroRuntime skips rule insertion but not variable insertion. Preserve token
        // computation/cache lifecycle while suppressing only those two CSS effects.
        // Do not silence arbitrary dynamicCSS calls: browser CSP tests must catch them.
        if (id.endsWith("/@ant-design/cssinjs/es/hooks/useGlobalCache.js")) {
          const source = readFileSync(id, "utf8");
          const needle = "onCacheEffect?.(cacheContent);";
          if (source.split(needle).length !== 2)
            throw new Error(
              "Review static Ant adapter after dependency update",
            );
          return source.replace(
            needle,
            "if (prefix !== 'token' && prefix !== 'cssVar') onCacheEffect?.(cacheContent);",
          );
        }
        if (id.endsWith("/@rc-component/util/es/getScrollBarSize.js")) {
          return `export { default, getTargetScrollBarSize } from ${JSON.stringify(fileURLToPath(new URL("./src/lib/scrollbar.ts", import.meta.url)))};`;
        }
      },
    },
  ],
  base: "/",
  build: { outDir: "dist", emptyOutDir: true, sourcemap: false },
  server: { host: "127.0.0.1" },
  preview: { host: "127.0.0.1", port: 4173 },
});
