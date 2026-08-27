/// <reference path="../.astro/types.d.ts" />

// Tells TypeScript about our env vars so import.meta.env.PUBLIC_* is typed.
// All env vars must be prefixed with PUBLIC_ to be exposed to the browser.
interface ImportMetaEnv {
  readonly PUBLIC_SHOPIFY_STORE_DOMAIN: string;
  readonly PUBLIC_SHOPIFY_STOREFRONT_TOKEN: string;
  readonly RESEND_API_KEY?: string;
  readonly CONTACT_FROM_EMAIL?: string;
  readonly SMTP_HOST?: string;
  readonly SMTP_PORT?: string;
  readonly SMTP_SECURE?: string;
  readonly SMTP_USER?: string;
  readonly SMTP_PASS?: string;
  readonly GMAIL_USER?: string;
  readonly GMAIL_APP_PASSWORD?: string;
  readonly EMAIL_USER?: string;
  readonly EMAIL_PASS?: string;
  readonly EMAIL_PASSWORD?: string;
  readonly TELEGRAM_BOT_TOKEN?: string;
  readonly NOTIFICATION_CHAT_ID?: string;
  readonly KLAVIYO_PRIVATE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
