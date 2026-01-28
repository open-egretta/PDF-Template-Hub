import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tsconfigPaths(),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "pdfme-core": ["@pdfme/common", "@pdfme/generator"],
          "pdfme-ui": ["@pdfme/ui"],
          "chakra-ui": ["@chakra-ui/react"],
        },
      },
    },
  },
  // esbuild: {
  //   drop: ["console"],
  // },
});
