// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// `output: "static"` builds a fully static site to `dist/`.
// Nginx will serve those files directly. No node server required.
export default defineConfig({
  output: "static",
  integrations: [
    react(),
    // applyBaseStyles:false means we control Tailwind imports in src/styles/global.css.
    // This is required for shadcn/ui's CSS variables to load correctly.
    tailwind({ applyBaseStyles: false }),
  ],
});
