import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with clsx */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format price for display (accepts number, string, or Prisma Decimal) */
export function formatPrice(amount: number | string | unknown): string {
  const n = decimalToNumber(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(n);
}

/** Decimal to number for calculations */
export function decimalToNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value) || 0;
  if (value && typeof value === "object" && "toNumber" in value)
    return (value as { toNumber: () => number }).toNumber();
  return 0;
}

/**
 * Formats a sequential order number into the branded 3DPS format.
 * orderNumber 1 → 3DPS1001, 2 → 3DPS1002, etc.
 * Falls back to last 8 chars of id if orderNumber is missing.
 */
export function formatOrderNumber(
  orderNumber: number | null | undefined,
  fallbackId?: string
): string {
  if (orderNumber) return `3DPS${1000 + orderNumber}`;
  if (fallbackId) return `3DPS-${fallbackId.slice(-6).toUpperCase()}`;
  return "3DPS----";
}
