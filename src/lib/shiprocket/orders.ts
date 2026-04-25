import { fetchWithAuth } from "./client";
import { z } from "zod";

// Zod schemas for internal validation
const OrderItemSchema = z.object({
  name: z.string(),
  sku: z.string().optional(),
  units: z.number().int().positive(),
  selling_price: z.number().min(0),
  discount: z.number().min(0).optional(),
  tax: z.number().optional().default(0),
  hsn: z.number().optional(),
});

export const ShiprocketOrderSchema = z.object({
  order_id: z.string(),
  order_date: z.string(), // "YYYY-MM-DD HH:mm"
  pickup_location: z.string().default("Primary"),
  channel_id: z.string().optional(),
  comment: z.string().optional(),
  billing_customer_name: z.string(),
  billing_last_name: z.string().optional(),
  billing_address: z.string(),
  billing_address_2: z.string().optional(),
  billing_city: z.string(),
  billing_pincode: z.string(),
  billing_state: z.string(),
  billing_country: z.string().default("India"),
  billing_email: z.string().email(),
  billing_phone: z.string(),
  shipping_is_billing: z.boolean().default(true),
  shipping_customer_name: z.string().optional(),
  shipping_last_name: z.string().optional(),
  shipping_address: z.string().optional(),
  shipping_address_2: z.string().optional(),
  shipping_city: z.string().optional(),
  shipping_pincode: z.string().optional(),
  shipping_country: z.string().optional(),
  shipping_state: z.string().optional(),
  shipping_email: z.string().optional(),
  shipping_phone: z.string().optional(),
  order_items: z.array(OrderItemSchema),
  payment_method: z.enum(["Prepaid", "COD"]),
  shipping_charges: z.number().optional().default(0),
  giftwrap_charges: z.number().optional().default(0),
  transaction_charges: z.number().optional().default(0),
  total_discount: z.number().optional().default(0),
  sub_total: z.number(),
  length: z.number().default(10), // Required, Default dims if not specified
  breadth: z.number().default(10),
  height: z.number().default(10),
  weight: z.number().default(0.5), // Required, Weight in Kg
});

export type CreateOrderInput = z.infer<typeof ShiprocketOrderSchema>;

export async function createOrder(orderParams: CreateOrderInput) {
  // Validate input parameters
  const validatedData = ShiprocketOrderSchema.parse(orderParams);

  // Send to Shiprocket via authenticated client
  return await fetchWithAuth("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify(validatedData),
  });
}
