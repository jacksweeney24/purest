import type { APIRoute } from "astro";
import { getProducts } from "@/lib/shopify";

export const prerender = true;

const staticPaths = [
  "/",
  "/products",
  "/real-ingredients",
  "/why-french-gray-sea-salt",
  "/about",
  "/science",
  "/faq",
  "/contact",
  "/returns",
  "/news",
  "/affiliate",
];

export const GET: APIRoute = async () => {
  const products = await getProducts();
  const paths = [
    ...staticPaths,
    ...products.map((product) => `/products/${product.handle}`),
  ];

  const urls = paths.map((path) => {
    const loc = new URL(path, "https://www.purestelectrolyte.com").toString();
    return `  <url><loc>${loc}</loc></url>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
