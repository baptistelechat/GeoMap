import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { traeBadgePlugin } from "vite-plugin-trae-solo-badge";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { qrcode } from 'vite-plugin-qrcode';

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: "hidden",
  },
  plugins: [
    react(),
    qrcode(),
    tailwindcss(),
    traeBadgePlugin({
      variant: "dark",
      position: "bottom-right",
      prodOnly: true,
      clickable: true,
      clickUrl: "https://www.trae.ai/solo?showJoin=1",
      autoTheme: true,
      autoThemeTarget: "#root",
    }),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
