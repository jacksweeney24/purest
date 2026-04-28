import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart-store";
import type { Product } from "@/lib/shopify";
import { formatPrice } from "@/lib/utils";

interface Props {
  product: Product;
}

/**
 * Larger, side-by-side feature on the homepage. Uses the same add-to-cart flow
 * as the product card.
 */
export default function FeaturedProduct({ product }: Props) {
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
    <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
      <div className="aspect-square overflow-hidden rounded-2xl bg-white">
        {product.image && (
          <img
            src={product.image.url}
            alt={product.image.altText ?? product.title}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div>
        <h2 className="font-serif text-3xl tracking-tight md:text-4xl">
          {product.title}
        </h2>
        <p className="mt-1 text-lg text-muted-foreground">
          {formatPrice(price.amount, price.currencyCode)}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button size="lg" disabled={soldOut} onClick={handleAdd}>
            {soldOut ? "Sold out" : "Add to cart"}
          </Button>
          <a href="/products" className="inline-block font-serif text-2xl font-bold tracking-tight text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity">Explore all flavors →</a>
        </div>
      </div>
    </div>
  );
}
