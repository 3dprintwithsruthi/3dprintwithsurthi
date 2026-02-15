/**
 * Shared types for 3D Print with Sruthi
 */
import type { User, Product, Order, OrderItem, OrderStatus, Role } from "@prisma/client";

export type { User, Product, Order, OrderItem, OrderStatus, Role };

/** Custom field definition for product (e.g. Name 1, Name 2, Custom Message) */
export interface CustomFieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "number";
  required?: boolean;
  placeholder?: string;
}

/** Custom input stored in OrderItem.customInput */
export type CustomInputValue = Record<string, string | number>;

/** Product with optional relations */
export interface ProductWithRelations extends Product {
  orderItems?: OrderItem[];
}

/** Order with items and user */
export interface OrderWithItems extends Order {
  orderItems: (OrderItem & { product: Product })[];
  user: User;
}

/** Cart item (client-side) */
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  customInput?: CustomInputValue;
  maxStock: number;
}
