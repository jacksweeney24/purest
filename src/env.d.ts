/// <reference path="../.astro/types.d.ts" />

// Tells TypeScript about our env vars so import.meta.env.PUBLIC_* is typed.
// All env vars must be prefixed with PUBLIC_ to be exposed to the browser.
interface ImportMetaEnv {
  readonly PUBLIC_SHOPIFY_STORE_DOMAIN: string;
  readonly PUBLIC_SHOPIFY_STOREFRONT_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
