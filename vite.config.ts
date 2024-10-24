// import path from "path"
// import react from "@vitejs/plugin-react"
// import { defineConfig } from "vite"
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// })
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path"; // Importing path for alias resolution

// Vite configuration
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Path alias
    },
  },
});

