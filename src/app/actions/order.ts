"use server";

/**
 * Order server actions – place order, update status (admin only)
 * Inventory auto-decrease on place; email on status change
 */
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-server";
import { addressSchema } from "@/lib/validations/checkout";
import { sendOrderStatusEmail } from "@/lib/email";
import { decimalToNumber } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const TAX_RATE = 0.18;
const SHIPPING_FLAT = 49;

export type OrderActionResult = { success: boolean; error?: string; orderId?: string };

/** Validate cart items against stock and return error if any out of stock */
function validateStock(
  items: { productId: string; quantity: number; name?: string }[],
  products: { id: string; stock: number; name: string }[]
): string | null {
  for (const item of items) {
    const p = products.find((x) => x.id === item.productId);
    if (!p) return `Product not found: ${item.name ?? item.productId}`;
    if (p.stock < item.quantity) return `Insufficient stock for ${p.name}. Max: ${p.stock}`;
  }
  return null;
}

/** Place order – status Pending, decrease inventory, prevent negative stock */
export async function placeOrderAction(formData: FormData): Promise<OrderActionResult> {
  const session = await getSession();
  if (!session?.user?.email || !(session.user as { id?: string }).id) {
    return { success: false, error: "You must be logged in to place an order" };
  }
  const userId = (session.user as { id: string }).id;

  const addressRaw = {
    fullName: formData.get("fullName"),
    addressLine1: formData.get("addressLine1"),
    addressLine2: formData.get("addressLine2"),
    city: formData.get("city"),
    state: formData.get("state"),
    pincode: formData.get("pincode"),
    phone: formData.get("phone"),
  };
  const addressParsed = addressSchema.safeParse(addressRaw);
  if (!addressParsed.success) {
    const msg = addressParsed.error.flatten().fieldErrors.addressLine1?.[0] ?? "Invalid address";
    return { success: false, error: msg };
  }

  const cartJson = formData.get("cartJson") as string | null;
  if (!cartJson) return { success: false, error: "Cart is empty" };

  let cart: { productId: string; quantity: number; price: number; customInput?: Record<string, unknown> }[];
  try {
    cart = JSON.parse(cartJson) as typeof cart;
    if (!Array.isArray(cart) || cart.length === 0) return { success: false, error: "Cart is empty" };
  } catch {
    return { success: false, error: "Invalid cart" };
  }

  const productIds = Array.from(new Set(cart.map((c) => c.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, stock: true, name: true, price: true },
  });

  const stockErr = validateStock(
    cart.map((c) => ({ productId: c.productId, quantity: c.quantity, name: undefined })),
    products.map((p) => ({ id: p.id, stock: p.stock, name: p.name }))
  );
  if (stockErr) return { success: false, error: stockErr };

  const addressStr = [
    addressParsed.data.fullName,
    addressParsed.data.addressLine1,
    addressParsed.data.addressLine2,
    `${addressParsed.data.city}, ${addressParsed.data.state} - ${addressParsed.data.pincode}`,
    addressParsed.data.phone,
  ]
    .filter(Boolean)
    .join("\n");

  let subtotal = 0;
  const orderItemsData = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    const price = product ? decimalToNumber(product.price) : item.price;
    const lineTotal = price * item.quantity;
    subtotal += lineTotal;
    return {
      productId: item.productId,
      quantity: item.quantity,
      price: new Decimal(price),
      customInput: (item.customInput ?? {}) as object,
    };
  });

  const tax = Math.round(subtotal * TAX_RATE);
  const shipping = SHIPPING_FLAT;
  const totalAmount = subtotal + tax + shipping;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          status: "Pending",
          totalAmount: new Decimal(totalAmount),
          address: addressStr,
        },
      });
      await tx.orderItem.createMany({
        data: orderItemsData.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          customInput: item.customInput,
        })),
      });
      for (const item of cart) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
      return order;
    });

    revalidatePath("/");
    revalidatePath("/orders");
    revalidatePath("/admin/orders");
    return { success: true, orderId: order.id };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to place order",
    };
  }
}

/** Admin only: update order status and send email */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus
): Promise<OrderActionResult> {
  const session = await getSession();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return { success: false, error: "Only admin can update order status" };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: { include: { product: true } },
      user: true,
    },
  });
  if (!order) return { success: false, error: "Order not found" };

  await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  await sendOrderStatusEmail(order, newStatus);
  revalidatePath("/admin/orders");
  revalidatePath("/orders");
  return { success: true, orderId };
}
