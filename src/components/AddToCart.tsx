import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart-store";
import type { Product } from "@/lib/shopify";

export default function AddToCart({ product }: { product: Product }) {
  const variant = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
  const soldOut = !variant?.availableForSale;

  function handleAdd() {
    if (!variant) return;
    addToCart({
      variantId: variant.id,
      productId: product.id,
      title: product.title,
      variantTitle: variant.title,
      price: parseFloat(variant.price.amount),
      currencyCode: variant.price.currencyCode,
      imageUrl: product.image?.url ?? null,
    });
  }

  return (
    <div className="space-y-4">
      <Button
        size="lg"
        className="w-full rounded-full h-14 text-base"
        disabled={soldOut}
        onClick={handleAdd}
      >
        {soldOut ? "Sold out" : "Add to cart"}
      </Button>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">🔄 Satisfaction guaranteed</span>
        <span className="flex items-center gap-1">🚚 Free shipping over $50</span>
      </div>
    </div>
  );
}
