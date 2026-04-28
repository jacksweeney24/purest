import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart-store";
import type { Product } from "@/lib/shopify";
import { formatPrice } from "@/lib/utils";

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
  const variant = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
  const price = variant?.price ?? product.priceRange.minVariantPrice;
  const soldOut = !variant?.availableForSale;

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
      <div className="aspect-square overflow-hidden rounded-lg bg-white">
        {product.image ? (
          <img
            src={product.image.url}
            alt={product.image.altText ?? product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="h-full w-full" />
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-2">
        <h3 className="text-base font-medium">{product.title}</h3>
        <span className="text-sm tabular-nums text-muted-foreground">
          {formatPrice(price.amount, price.currencyCode)}
        </span>
      </div>
      {product.description && (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>
      )}
      <Button
        className="mt-4"
        variant="outline"
        disabled={soldOut}
        onClick={handleAdd}
      >
        {soldOut ? "Sold out" : "Add to cart"}
      </Button>
    </article>
  );
}
