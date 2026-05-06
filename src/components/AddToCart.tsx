import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart-store";
import type { Product, SellingPlan } from "@/lib/shopify";

export default function AddToCart({ product }: { product: Product }) {
  const variant = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
  const soldOut = !variant?.availableForSale;

  // Flatten all selling plans from all groups
  const allPlans: SellingPlan[] = (product.sellingPlanGroups ?? []).flatMap(
    (g) => g.sellingPlans,
  );
  const hasSubscription = allPlans.length > 0;

  const [purchaseType, setPurchaseType] = useState<"one-time" | "subscribe">(
    hasSubscription ? "subscribe" : "one-time",
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    allPlans[0]?.id ?? "",
  );

  const selectedPlan = allPlans.find((p) => p.id === selectedPlanId);

  // Try to extract discount percentage from the plan's price adjustments
  function getPlanDiscount(plan: SellingPlan): string {
    const adj = plan.priceAdjustments?.[0]?.adjustmentValue as any;
    if (adj?.adjustmentPercentage) return `${adj.adjustmentPercentage}% off`;
    return "discounted";
  }

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
      sellingPlanId: purchaseType === "subscribe" ? selectedPlanId : undefined,
      sellingPlanName: purchaseType === "subscribe" ? selectedPlan?.name : undefined,
    });
  }

  return (
    <div className="space-y-4">
      {/* Purchase type toggle */}
      {hasSubscription && (
        <div className="rounded-xl border border-border overflow-hidden">
          {/* One-time option */}
          <button
            onClick={() => setPurchaseType("one-time")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
              purchaseType === "one-time"
                ? "bg-stone-50 border-b border-border"
                : "hover:bg-stone-50 border-b border-border"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                purchaseType === "one-time"
                  ? "border-foreground"
                  : "border-muted-foreground"
              }`}
            >
              {purchaseType === "one-time" && (
                <span className="w-2 h-2 rounded-full bg-foreground block" />
              )}
            </span>
            <span className="text-sm font-medium">One-time purchase</span>
          </button>

          {/* Subscribe option */}
          <button
            onClick={() => setPurchaseType("subscribe")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
              purchaseType === "subscribe" ? "bg-green-50" : "hover:bg-stone-50"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                purchaseType === "subscribe"
                  ? "border-green-700"
                  : "border-muted-foreground"
              }`}
            >
              {purchaseType === "subscribe" && (
                <span className="w-2 h-2 rounded-full bg-green-700 block" />
              )}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Subscribe &amp; Save</span>
                {allPlans[0] && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                    {getPlanDiscount(allPlans[0])}
                  </span>
                )}
              </div>
              {/* Plan frequency selector */}
              {purchaseType === "subscribe" && allPlans.length > 1 && (
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 text-xs text-muted-foreground bg-transparent border border-border rounded px-2 py-1"
                >
                  {allPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              )}
              {purchaseType === "subscribe" && allPlans.length === 1 && (
                <p className="text-xs text-muted-foreground mt-0.5">{allPlans[0].name}</p>
              )}
            </div>
          </button>
        </div>
      )}

      <Button
        size="lg"
        className="w-full rounded-full h-14 text-base"
        disabled={soldOut}
        onClick={handleAdd}
      >
        {soldOut ? "Sold out" : purchaseType === "subscribe" ? "Subscribe & Save" : "Add to cart"}
      </Button>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">🔄 Satisfaction guaranteed</span>
        <span className="flex items-center gap-1">🚚 Free shipping over $50</span>
      </div>
    </div>
  );
}
