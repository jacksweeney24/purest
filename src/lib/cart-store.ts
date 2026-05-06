import { atom, computed } from "nanostores";

/**
 * Cart state shared across React islands.
 *
 * Why nanostores instead of React Context?
 * In Astro, every `client:load` component is rendered as a separate "island"
 * with its own React tree. They don't share React context. Nanostores gives
 * us a tiny global store that any island can subscribe to.
 *
 * The cart is also persisted to localStorage so it survives page navigations
 * (Astro hydrates each page fresh, so without persistence the cart would reset).
 */

export interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  variantTitle: string;
  price: number;
  currencyCode: string;
  imageUrl: string | null;
  quantity: number;
  sellingPlanId?: string;
  sellingPlanName?: string;
}

const STORAGE_KEY = "purest-cart-v1";

// SSR-safe initial load. `import.meta.env.SSR` is true during the Astro build.
function loadInitial(): CartItem[] {
  if (import.meta.env.SSR || typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export const $cart = atom<CartItem[]>(loadInitial());
export const $cartOpen = atom<boolean>(false);

// Derived totals. Recompute automatically when $cart changes.
export const $cartCount = computed($cart, (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0),
);

export const $cartSubtotal = computed($cart, (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0),
);

// Persist to localStorage whenever the cart changes.
if (typeof window !== "undefined") {
  $cart.subscribe((items) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage can throw if the user has it disabled — silently no-op.
    }
  });
}

// --- Actions ---------------------------------------------------------------

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1): void {
  const current = $cart.get();
  const existing = current.find((c) => c.variantId === item.variantId);
  if (existing) {
    $cart.set(
      current.map((c) =>
        c.variantId === item.variantId ? { ...c, quantity: c.quantity + quantity } : c,
      ),
    );
  } else {
    $cart.set([...current, { ...item, quantity }]);
  }
  $cartOpen.set(true); // Open the drawer when something is added — instant feedback.
}

export function updateQuantity(variantId: string, quantity: number): void {
  if (quantity <= 0) {
    removeFromCart(variantId);
    return;
  }
  $cart.set(
    $cart.get().map((c) => (c.variantId === variantId ? { ...c, quantity } : c)),
  );
}

export function removeFromCart(variantId: string): void {
  $cart.set($cart.get().filter((c) => c.variantId !== variantId));
}

export function clearCart(): void {
  $cart.set([]);
}

export function openCart(): void {
  $cartOpen.set(true);
}

export function closeCart(): void {
  $cartOpen.set(false);
}
