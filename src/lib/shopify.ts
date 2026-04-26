/**
 * Shopify Storefront API client.
 *
 * Until Pam's real credentials land, this module falls back to mock products
 * (defined in src/data/products.json) so the site works end-to-end in dev.
 *
 * To switch to real Shopify, just fill in PUBLIC_SHOPIFY_STORE_DOMAIN and
 * PUBLIC_SHOPIFY_STOREFRONT_TOKEN in `.env`. No code change required.
 */

import mockProducts from "@/data/products.json";

const domain = import.meta.env.PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = import.meta.env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

/** Returns true when real Shopify creds are configured. */
export const hasShopify = Boolean(domain && token);

// --- Public types ----------------------------------------------------------

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ProductImage {
  url: string;
  altText: string | null;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: Money;
  availableForSale: boolean;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  priceRange: { minVariantPrice: Money };
  image: ProductImage | null;
  variants: ProductVariant[];
}

// --- API client ------------------------------------------------------------

/**
 * Low-level fetch wrapper. Throws on network errors; bubbles GraphQL errors up
 * to the caller via the returned `errors` array.
 */
export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<{ data?: T; errors?: { message: string }[] }> {
  if (!hasShopify) {
    throw new Error("Shopify is not configured. Set PUBLIC_SHOPIFY_* env vars.");
  }
  const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

// --- Public functions ------------------------------------------------------

/** Fetches all products, or returns mock data if Shopify is not configured. */
export async function getProducts(): Promise<Product[]> {
  if (!hasShopify) {
    return mockProducts as Product[];
  }
  const query = `{
    products(first: 20) {
      edges {
        node {
          id
          title
          description
          handle
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 1) { edges { node { url altText } } }
          variants(first: 5) {
            edges {
              node {
                id
                title
                price { amount currencyCode }
                availableForSale
              }
            }
          }
        }
      }
    }
  }`;
  type Edge<T> = { node: T };
  type Resp = {
    products: {
      edges: Edge<{
        id: string;
        title: string;
        description: string;
        handle: string;
        priceRange: { minVariantPrice: Money };
        images: { edges: Edge<ProductImage>[] };
        variants: { edges: Edge<ProductVariant>[] };
      }>[];
    };
  };
  const { data, errors } = await shopifyFetch<Resp>(query);
  if (errors?.length || !data) {
    throw new Error(errors?.map((e) => e.message).join("; ") ?? "Unknown Shopify error");
  }
  return data.products.edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    description: node.description,
    handle: node.handle,
    priceRange: node.priceRange,
    image: node.images.edges[0]?.node ?? null,
    variants: node.variants.edges.map((e) => e.node),
  }));
}

/**
 * Creates a Shopify checkout and returns the URL to redirect the user to.
 * In mock mode, redirects to /thank-you (a placeholder you can build later).
 */
export async function createCheckout(
  lines: { variantId: string; quantity: number }[],
): Promise<string> {
  if (!hasShopify) {
    // No real backend yet — surface a friendly placeholder so the cart UX still works.
    return "/thank-you";
  }
  const lineItems = lines
    .map((l) => `{ variantId: "${l.variantId}", quantity: ${l.quantity} }`)
    .join(", ");
  const query = `mutation {
    checkoutCreate(input: { lineItems: [${lineItems}] }) {
      checkout { webUrl }
      checkoutUserErrors { message }
    }
  }`;
  type Resp = {
    checkoutCreate: {
      checkout: { webUrl: string } | null;
      checkoutUserErrors: { message: string }[];
    };
  };
  const { data, errors } = await shopifyFetch<Resp>(query);
  const userErrors = data?.checkoutCreate.checkoutUserErrors ?? [];
  if (errors?.length || userErrors.length || !data?.checkoutCreate.checkout) {
    const all = [...(errors ?? []), ...userErrors].map((e) => e.message).join("; ");
    throw new Error(all || "Failed to create checkout");
  }
  return data.checkoutCreate.checkout.webUrl;
}
