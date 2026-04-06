import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  outDir: "dist",
  format: ["esm"],
  target: "node18",
  noExternal: ["knowledge-layer"],
  banner: {
    js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
  },
  clean: true,
});
