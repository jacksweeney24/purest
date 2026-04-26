# Purest Electrolyte

The frontend for [purestelectrolyte.com](https://purestelectrolyte.com). Built with Astro + React + Tailwind + shadcn/ui. Shopify is the backend — this site renders the marketing pages and pushes the cart over to Shopify checkout.

## Quick start

```bash
npm install      # one time
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## Project layout

```
src/
├── components/
│   ├── ui/                  # shadcn primitives (button, card, badge, sheet)
│   ├── Cart.tsx             # slide-out cart drawer (React)
│   ├── CartIcon.tsx         # cart count badge in nav (React)
│   ├── FeaturedProduct.tsx  # homepage hero product (React)
│   ├── Footer.astro
│   ├── Hero.astro
│   ├── Nav.astro
│   ├── Newsletter.tsx       # email signup (React, stub)
│   ├── ProductCard.tsx      # one product (React)
│   ├── ProductGrid.tsx      # grid of products (React)
│   ├── SaleBanner.astro     # toggleable sale banner
│   ├── SubscriptionCTA.astro
│   ├── Testimonials.astro
│   └── ValueProps.astro
├── data/
│   ├── products.json        # mock products (used until Shopify is connected)
│   ├── site-config.json     # hero text, sale banner, footer links
│   └── testimonials.json
├── layouts/Layout.astro     # base HTML shell
├── lib/
│   ├── cart-store.ts        # nanostores cart state (shared across React islands)
│   ├── shopify.ts           # Shopify Storefront API client (with mock fallback)
│   └── utils.ts             # cn(), formatPrice()
├── pages/
│   ├── about.astro
│   ├── index.astro
│   ├── products/index.astro
│   └── thank-you.astro      # placeholder until Shopify checkout is live
└── styles/global.css        # Tailwind + brand CSS variables
```

## Files Pam's agent edits most

| File | What it controls |
|------|-----------------|
| `src/data/site-config.json` | Hero text, CTAs, sale banner, footer links |
| `src/data/testimonials.json` | All testimonials |
| `src/data/products.json` | Mock products (only used until Shopify is connected) |
| `public/images/` | Logo, hero, product photos |
| `src/pages/about.astro` | Pam's story |
| `src/components/ValueProps.astro` | "Real fruit / Real salt / Nothing else" blocks |

## Connecting Shopify

When you have Storefront API credentials, copy `.env.example` to `.env`:

```env
PUBLIC_SHOPIFY_STORE_DOMAIN=purest-electrolyte.myshopify.com
PUBLIC_SHOPIFY_STOREFRONT_TOKEN=<your token>
```

The app auto-detects these. With both set, products and checkout pull from Shopify; without them, mock products from `src/data/products.json` are used.

## State management

The cart is shared across React islands using **nanostores** (`src/lib/cart-store.ts`). React Context doesn't work in Astro because each `client:load` component is a separate React tree. Nanostores is a 1KB store that works across islands. The cart is also persisted to `localStorage` so it survives page navigations.

## Deploying (nginx)

```nginx
server {
    listen 80;
    server_name purestelectrolyte.com;
    root /home/purest/purest-site/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Rebuild after edits: `npm run build`. Nginx serves `dist/` directly — no node process required.
