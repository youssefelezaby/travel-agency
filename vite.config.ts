import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  ssr: {
    noExternal: [/@syncfusion/],
  },
  server: {
    host: true, // Allow external connections for mobile testing
    port: 5173,
    cors: true,
  },
  preview: {
    host: true, // Allow external connections for mobile testing in preview mode
    port: 4173,
    cors: true,
  },
});
