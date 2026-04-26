import { useStore } from "@nanostores/react";
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  $cart,
  $cartOpen,
  $cartSubtotal,
  closeCart,
  removeFromCart,
  updateQuantity,
} from "@/lib/cart-store";
import { createCheckout } from "@/lib/shopify";
import { formatPrice } from "@/lib/utils";

/**
 * Slide-out cart drawer. Mounted once at the layout level.
 * Subscribes to the global cart store; opens automatically when items are added.
 */
export default function Cart() {
  const items = useStore($cart);
  const open = useStore($cartOpen);
  const subtotal = useStore($cartSubtotal);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const currency = items[0]?.currencyCode ?? "USD";

  // Why an event handler instead of an effect: this only runs when the user clicks.
  async function handleCheckout() {
    setCheckoutError(null);
    setIsCheckingOut(true);
    try {
      const url = await createCheckout(
        items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      );
      window.location.href = url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Checkout failed");
      setIsCheckingOut(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => (o ? null : closeCart())}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>Your cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild variant="outline" onClick={closeCart}>
              <a href="/products">Browse products</a>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4 py-4">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-20 w-20 flex-shrink-0 rounded-md bg-secondary object-cover"
                    />
                  )}
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium leading-tight">
                          {item.title}
                        </div>
                        {item.variantTitle &&
                          item.variantTitle !== "Default Title" && (
                            <div className="text-xs text-muted-foreground">
                              {item.variantTitle}
                            </div>
                          )}
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${item.title}`}
                        onClick={() => removeFromCart(item.variantId)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(q) => updateQuantity(item.variantId, q)}
                      />
                      <div className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity, item.currencyCode)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t px-6 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal, currency)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout.
              </p>
              {checkoutError && (
                <p className="mt-2 text-xs text-destructive">{checkoutError}</p>
              )}
              <Button
                className="mt-4 w-full"
                size="lg"
                disabled={isCheckingOut}
                onClick={handleCheckout}
              >
                {isCheckingOut ? "Redirecting…" : "Checkout"}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function QuantityStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-md border">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(value - 1)}
        className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-6 text-center text-sm tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
