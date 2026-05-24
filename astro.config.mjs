// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";

// `output: "static"` with vercel adapter — static pages + server API routes via prerender=false.
export default defineConfig({
  output: "static",
  adapter: vercel(),
  integrations: [
    react(),
    // applyBaseStyles:false means we control Tailwind imports in src/styles/global.css.
    // This is required for shadcn/ui's CSS variables to load correctly.
    tailwind({ applyBaseStyles: false }),
  ],
});
