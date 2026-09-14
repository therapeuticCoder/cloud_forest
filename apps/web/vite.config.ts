import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

function lucideDirectImports() {
  return {
    name: "lucide-direct-imports",
    enforce: "pre" as const,
    transform(code: string, id: string) {
      if (!/\.[jt]sx?$/.test(id) || id.includes("node_modules")) return null;

      const transformed = code.replace(
        /import\s*{\s*([^}]+)\s*}\s*from\s*["']lucide-react["'];?/g,
        (_match, imports: string) =>
          imports
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean)
            .map((entry) => {
              const [iconName, localName = iconName] = entry.split(/\s+as\s+/);
              const iconPath = iconName
                .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
                .replace(/([a-zA-Z])(\d+)/g, "$1-$2")
                .toLowerCase();
              return `import ${localName} from "lucide-react/dist/esm/icons/${iconPath}.mjs";`;
            })
            .join("\n"),
      );

      return transformed === code ? null : { code: transformed, map: null };
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    lucideDirectImports(),
    {
      name: "e2e-stale-service-worker",
      apply: (_config, environment) =>
        mode === "e2e" && environment.command === "serve",
      configureServer(server) {
        server.middlewares.use(
          "/e2e-stale-service-worker.js",
          (_request, response) => {
            response.statusCode = 200;
            response.setHeader("Content-Type", "text/javascript");
            response.setHeader("Service-Worker-Allowed", "/");
            response.end(
              "self.addEventListener('install', () => self.skipWaiting()); self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));",
            );
          },
        );
      },
    },
    react(),
    tailwindcss(),
    VitePWA({
      disable: mode === "test",
      strategies: "injectManifest",
      srcDir: "src/pwa",
      filename: "serviceWorker.ts",
      injectRegister: null,
      manifest: {
        id: "/",
        name: "Cloud Forest",
        short_name: "Cloud Forest",
        description:
          "Deliberately cultivate a smaller, community-centered social world.",
        theme_color: "#082419",
        background_color: "#29180f",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      registerType: "prompt",
      injectManifest: {
        globPatterns: [
          "**/*.{html,js,css,woff2,png}",
          "app-icon.svg",
          "icons.svg",
        ],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        rollupFormat: "iife",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: ["scollinsstudio.tail7ad917.ts.net"],
    proxy: {
      "/api": "http://127.0.0.1:3001",
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    globals: true,
    pool: "threads",
    maxWorkers: 1,
    fileParallelism: false,
  },
}));
