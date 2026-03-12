import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const replitPlugins = async () => {
  if (process.env.NODE_ENV === "production" || !process.env.REPL_ID) return [];
  try {
    const [errorModal, cartographer, devBanner] = await Promise.all([
      import("@replit/vite-plugin-runtime-error-modal").then(m => m.default()),
      import("@replit/vite-plugin-cartographer").then(m => m.cartographer()),
      import("@replit/vite-plugin-dev-banner").then(m => m.devBanner()),
    ]);
    return [errorModal, cartographer, devBanner];
  } catch {
    return [];
  }
};

const metaImagesPlugin = async () => {
  try {
    const { metaImagesPlugin: plugin } = await import("./vite-plugin-meta-images");
    return [plugin()];
  } catch {
    return [];
  }
};

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(await replitPlugins()),
    ...(await metaImagesPlugin()),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
