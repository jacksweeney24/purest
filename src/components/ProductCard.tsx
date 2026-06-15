import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart-store";
import type { Product, SellingPlan } from "@/lib/shopify";
import { formatPrice } from "@/lib/utils";
import flavorCopy from "@/data/flavor-copy.json";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const hasVariants = product.variants.length > 1;
  const variant = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
  const price = variant?.price ?? product.priceRange.minVariantPrice;
  const compareAt = variant?.compareAtPrice;
  const soldOut = !variant?.availableForSale;
  const isBundle = product.handle === 'the-hydration-ritual-kit';

  // All subscription plans
  const allPlans: SellingPlan[] = (product.sellingPlanGroups ?? []).flatMap((g) => g.sellingPlans);
  const hasSubscription = allPlans.length > 0 && !hasVariants && !soldOut;

  // State: is the frequency picker open?
  const [showFrequency, setShowFrequency] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(allPlans[0]?.id ?? "");

  const selectedPlan = allPlans.find((p) => p.id === selectedPlanId) ?? allPlans[0];

  // Get subscribe price for a given plan
  function getPlanPrice(plan: SellingPlan): string | null {
    if (!plan || !price) return null;
    const adj = plan.priceAdjustments?.[0]?.adjustmentValue as any;
    const basePrice = parseFloat(price.amount);
    if (adj?.adjustmentPercentage) {
      const subPrice = basePrice * (1 - adj.adjustmentPercentage / 100);
      return formatPrice(subPrice.toFixed(2), price.currencyCode);
    }
    if (adj?.adjustmentAmount?.amount) {
      const subPrice = basePrice - parseFloat(adj.adjustmentAmount.amount);
      return formatPrice(subPrice.toFixed(2), price.currencyCode);
    }
    if (adj?.price?.amount) {
      return formatPrice(adj.price.amount, price.currencyCode);
    }
    return null;
  }

  // Get discount % label for a plan
  function getPlanDiscount(plan: SellingPlan): string {
    const adj = plan.priceAdjustments?.[0]?.adjustmentValue as any;
    if (adj?.adjustmentPercentage) return `${adj.adjustmentPercentage}% off`;
    return "Save";
  }

  // Friendly label shortening
  function shortLabel(name: string): string {
    if (/month/i.test(name) && !/2|3|two|three/i.test(name)) return "Monthly";
    if (/2.month|every 2/i.test(name)) return "Every 2 Mo";
    if (/3.month|every 3/i.test(name)) return "Every 3 Mo";
    return name;
  }

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
    setShowFrequency(false);
  }

  // Build CartPlan objects for the store
  function buildCartPlan(plan: SellingPlan) {
    const adj = plan.priceAdjustments?.[0]?.adjustmentValue as any;
    const discountPct = adj?.adjustmentPercentage ?? 0;
    return { id: plan.id, name: plan.name, discountPct };
  }

  function handleSubscribeConfirm() {
    if (!variant || !selectedPlan) return;
    addToCart({
      variantId: variant.id,
      productId: product.id,
      title: product.title,
      variantTitle: variant.title,
      price: parseFloat(price.amount),
      currencyCode: price.currencyCode,
      imageUrl: product.image?.url ?? null,
      sellingPlanId: selectedPlan.id,
      sellingPlanName: selectedPlan.name,
      availablePlans: allPlans.map(buildCartPlan),
    });
    setShowFrequency(false);
  }

  const firstPlanPrice = allPlans[0] ? getPlanPrice(allPlans[0]) : null;
  const selectedPlanPrice = selectedPlan ? getPlanPrice(selectedPlan) : null;

  return (
    <article className="group flex flex-col">
      <a href={`/products/${product.handle}`} className="block relative flex-1">
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
      ) : hasSubscription && firstPlanPrice ? (
        <div className="mt-4 flex flex-col gap-2">
          {/* One-time button — always visible */}
          <button
            onClick={handleAdd}
            disabled={soldOut}
            className="flex items-center justify-between w-full rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
          >
            <span className="flex items-center gap-1.5">
              <span className="text-xs">↗</span> One-time
            </span>
            <span className="font-semibold">{formatPrice(price.amount, price.currencyCode)}</span>
          </button>

          {/* Subscribe button — opens frequency picker */}
          {!showFrequency ? (
            <div>
              <button
                onClick={() => setShowFrequency(true)}
                className="flex items-center justify-between w-full rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-xs">↗</span> Subscribe &amp; Save
                </span>
                <span className="font-semibold">{firstPlanPrice}</span>
              </button>
              <p className="text-center text-xs text-muted-foreground mt-1.5">Pause or cancel anytime</p>
            </div>
          ) : (
            /* Frequency picker — expands in place */
            <div className="rounded-2xl border border-foreground/20 bg-stone-50 p-3 flex flex-col gap-2">
              <p className="text-xs font-medium text-foreground/60 uppercase tracking-wide">Delivery frequency</p>
              <div className="flex gap-2 flex-wrap">
                {allPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`flex-1 min-w-0 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                      selectedPlanId === plan.id
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background border-input hover:border-foreground"
                    }`}
                  >
                    {shortLabel(plan.name)}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>{selectedPlan?.name}</span>
              </div>
              <button
                onClick={handleSubscribeConfirm}
                className="w-full rounded-full bg-foreground text-background py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Subscribe for {selectedPlanPrice}
              </button>
              <button
                onClick={() => setShowFrequency(false)}
                className="text-xs text-muted-foreground hover:text-foreground text-center transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
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
