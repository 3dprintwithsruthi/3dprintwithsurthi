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
import cashfree from "@/lib/cashfree";
import { headers } from "next/headers";
import { pushOrderToShiprocket } from "@/lib/shiprocket";
import type { OrderStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const TAX_RATE = 0;
const SHIPPING_FLAT = 0;

export type OrderActionResult = { success: boolean; error?: string; orderId?: string; paymentSessionId?: string; env?: string };

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

  const addressStr = JSON.stringify(addressParsed.data);

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
  let totalAmount = subtotal + tax + shipping;

  const couponCode = formData.get("couponCode") as string | null;
  let discount = 0;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon && coupon.isActive) {
      discount = Math.min(Number(coupon.discountValue), totalAmount);
      totalAmount -= discount;
    }
  }

  // Get payment method
  const paymentMethod = (formData.get("paymentMethod") as string) || "COD"; // "COD" or "ONLINE"

  try {
    const order = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          status: "Pending",
          totalAmount: new Decimal(totalAmount),
          discount: new Decimal(discount),
          couponCode: discount > 0 ? couponCode : null,
          address: addressStr,
          paymentMethod,
          paymentStatus: paymentMethod === "ONLINE" ? "PENDING" : "PENDING", // PENDING for both initially
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
      if (paymentMethod === "COD") {
        for (const item of cart) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // Update the user's phone number in the DB from the order details
      if (addressParsed.data.phone) {
        await tx.user.update({
          where: { id: userId },
          data: { phone: addressParsed.data.phone },
        });
      }

      return order;
    });

    if (paymentMethod === "ONLINE") {
      try {
        const headersList = await headers();
        const host = headersList.get("host");
        const protocol = headersList.get("x-forwarded-proto") || "http";
        // On Vercel, x-forwarded-proto is 'https' and host is the real production URL.
        const domain = host ? `${protocol}://${host}` : process.env.NEXTAUTH_URL!;

        const createOrderRequest = {
          order_id: order.id,
          order_amount: totalAmount,
          order_currency: "INR",
          customer_details: {
            customer_id: userId,
            customer_phone: addressParsed.data.phone,
            customer_name: addressParsed.data.fullName,
            customer_email: session.user.email || "guest@example.com"
          },
          order_meta: {
            return_url: `${domain}/orders/verify?order_id=${order.id}`,
            notify_url: `${domain}/api/cashfree/webhook`
          },
          order_note: "3D Print Order"
        };

        const response = await cashfree.PGCreateOrder(createOrderRequest);
        const paymentSessionId = response.data.payment_session_id;

        return {
          success: true,
          orderId: order.id,
          paymentSessionId,
          env: process.env.CASHFREE_ENV === "PRODUCTION" ? "production" : "sandbox"
        };

      } catch (cfError) {
        console.error("Cashfree Error:", cfError);
        // If payment creation fails, mark order as FAILED.
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: "FAILED", status: "Rejected" }
        });
        revalidatePath("/orders");
        const cfErr = cfError as any;
        const cfErrorMsg = cfErr.response?.data?.message || cfErr.message || "Unknown Cashfree API Error";
        return { success: false, error: `Payment Gateway Error: ${cfErrorMsg}. Please try Cash on Delivery.` };
      }
    } else {
      // If paymentMethod is COD, push to Shiprocket immediately
      await pushOrderToShiprocket(order.id);
    }

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
