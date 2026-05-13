import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// SPA fallback for static hosts (Timeweb Cloud, Nginx, etc.)
// Copies dist/index.html -> dist/200.html so deep links resolve to the SPA shell.
const spaFallbackPlugin = () => ({
  name: "spa-fallback-200",
  apply: "build" as const,
  closeBundle() {
    const dist = path.resolve(__dirname, "dist");
    const src = path.join(dist, "index.html");
    const dst = path.join(dist, "200.html");
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
    }
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), spaFallbackPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
