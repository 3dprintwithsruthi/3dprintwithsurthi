/**
 * Zod schemas for product (create, update)
 */
import { z } from "zod";

const customFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["text", "textarea", "number"]),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  images: z.array(z.string().refine((s) => s.startsWith("http://") || s.startsWith("https://"), { message: "Each image must be a valid URL" })).default([]),
  videoUrl: z.string().url().optional().or(z.literal("")),
  customFields: z.array(customFieldSchema).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
