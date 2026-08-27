/// <reference path="../.astro/types.d.ts" />

// Tells TypeScript about our env vars so import.meta.env.PUBLIC_* is typed.
// All env vars must be prefixed with PUBLIC_ to be exposed to the browser.
interface ImportMetaEnv {
  readonly PUBLIC_SHOPIFY_STORE_DOMAIN: string;
  readonly PUBLIC_SHOPIFY_STOREFRONT_TOKEN: string;
  readonly RESEND_API_KEY?: string;
  readonly CONTACT_TO_EMAIL?: string;
  readonly CONTACT_FROM_EMAIL?: string;
  readonly TELEGRAM_BOT_TOKEN?: string;
  readonly NOTIFICATION_CHAT_ID?: string;
  readonly KLAVIYO_PRIVATE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
