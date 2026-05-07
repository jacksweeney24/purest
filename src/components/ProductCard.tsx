import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart-store";
import type { Product } from "@/lib/shopify";
import { formatPrice } from "@/lib/utils";
import flavorCopy from "@/data/flavor-copy.json";

interface Props {
  product: Product;
}

/**
 * A single product card. Clicking "Add to cart" pushes the first available
 * variant into the global cart store. The Cart drawer opens automatically.
 *
 * Why use an event handler (not an effect): the user clicked. That's the cause.
 */
export default function ProductCard({ product }: Props) {
  const hasVariants = product.variants.length > 1;
  const variant = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
  const price = variant?.price ?? product.priceRange.minVariantPrice;
  const compareAt = variant?.compareAtPrice;
  const soldOut = !variant?.availableForSale;
  const isBundle = product.handle === 'the-hydration-ritual-kit';

  function handleAdd() {
    if (!variant) return;
    addToCart({
      variantId: variant.id,
      productId: product.id,
      title: product.title,
      variantTitle: variant.title,
      price: parseFloat(price.amount),
      currencyCode: price.currencyCode,
      imageUrl: product.image?.url ?? null,
    });
  }

  return (
    <article className="group flex flex-col">
      <a href={`/products/${product.handle}`} className="block relative">
        {/* Best Value badge for bundle */}
        {isBundle && (
          <div className="absolute top-3 left-3 z-10 bg-foreground text-background text-xs font-medium px-3 py-1 rounded-full">
            Best Value
          </div>
        )}
        <div className="aspect-square overflow-hidden rounded-lg bg-white">
          {product.image ? (
            <img
              src={product.image.url}
              alt={product.image.altText ?? product.title}
              loading="lazy"
              className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="h-full w-full" />
          )}
        </div>
        <div className="mt-4">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-base font-medium">{product.title}</h3>
            <div className="flex items-baseline gap-1.5 tabular-nums">
              {compareAt && parseFloat(compareAt.amount) > parseFloat(price.amount) && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(compareAt.amount, compareAt.currencyCode)}
                </span>
              )}
              <span className="text-base font-semibold">
                {formatPrice(price.amount, price.currencyCode)}
              </span>
            </div>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {(flavorCopy as any)[product.handle]?.tagline ?? product.description}
          </p>
        </div>
      </a>
      {hasVariants ? (
        <a
          href={`/products/${product.handle}`}
          className="mt-4 inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Choose flavor →
        </a>
      ) : (
        <Button
          className="mt-4"
          variant="outline"
          disabled={soldOut}
          onClick={handleAdd}
        >
          {soldOut ? "Sold out" : "Add to cart"}
        </Button>
      )}
    </article>
  );
}
