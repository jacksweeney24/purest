import { useStore } from "@nanostores/react";
import { ShoppingBag } from "lucide-react";
import { $cartCount, openCart } from "@/lib/cart-store";

/**
 * Live cart count badge. Lives in the Nav as a React island so it can
 * subscribe to the cart store and update the count in real time.
 */
export default function CartIcon() {
  const count = useStore($cartCount);
  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open cart (${count} ${count === 1 ? "item" : "items"})`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-medium leading-none text-accent-foreground"
        >
          {count}
        </span>
      )}
    </button>
  );
}
