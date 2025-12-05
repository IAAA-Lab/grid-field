import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: "./src/main.js",
      output: {
        entryFileNames: "compiledlibs.js",
        chunkFileNames: "chunks/[name].js",
        assetFileNames: "assets/[name].[ext]",
      }
    },
    outDir: "../web/static/js",
    emptyOutDir: false,
    sourcemap: true,
  },
});
