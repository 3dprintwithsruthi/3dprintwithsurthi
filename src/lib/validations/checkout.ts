/**
 * Zod schemas for checkout (address, place order)
 */
import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit phone required"),
});

export type AddressInput = z.infer<typeof addressSchema>;
