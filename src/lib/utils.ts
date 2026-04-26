import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names intelligently.
 * - clsx flattens conditional classes (`cn("a", cond && "b")`)
 * - twMerge resolves Tailwind conflicts (`cn("p-2", "p-4")` -> `"p-4"`)
 *
 * Used throughout shadcn/ui — required for those components to work correctly.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format cents (or any number) as a currency string for product prices. */
export function formatPrice(amount: number | string, currency = "USD"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}
