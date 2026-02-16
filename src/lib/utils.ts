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
