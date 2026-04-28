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
    <Button
      size="lg"
      className="w-full rounded-full"
      disabled={soldOut}
      onClick={handleAdd}
    >
      {soldOut ? "Sold out" : "Add to cart"}
    </Button>
  );
}
