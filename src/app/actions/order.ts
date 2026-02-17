"use server";

/**
 * Order server actions with Coupon support and Invoice generation
 */
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-server";
import { addressSchema } from "@/lib/validations/checkout";
import { sendOrderStatusEmail } from "@/lib/email";
import { decimalToNumber } from "@/lib/utils";
import cashfree from "@/lib/cashfree";
import { getBaseUrl } from "@/lib/url";
import type { OrderStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const TAX_RATE = 0;
const SHIPPING_FLAT = 0;

export type OrderActionResult = {
  success: boolean;
  error?: string;
  orderId?: string;
  paymentSessionId?: string;
};

export type CouponValidationResult = {
  success: boolean;
  error?: string;
  discount?: number;
  discountType?: string;
};

/** Validate coupon code */
export async function validateCouponAction(code: string, subtotal: number): Promise<CouponValidationResult> {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return { success: false, error: "Invalid coupon code" };
    }

    if (!coupon.isActive) {
      return { success: false, error: "This coupon is no longer active" };
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return { success: false, error: "This coupon has expired" };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { success: false, error: "This coupon has reached its usage limit" };
    }

    if (coupon.minOrderValue && subtotal < decimalToNumber(coupon.minOrderValue)) {
      return {
        success: false,
        error: `Minimum order value of ₹${decimalToNumber(coupon.minOrderValue)} required`
      };
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = Math.round((subtotal * decimalToNumber(coupon.discountValue)) / 100);
      if (coupon.maxDiscount) {
        discount = Math.min(discount, decimalToNumber(coupon.maxDiscount));
      }
    } else {
      discount = decimalToNumber(coupon.discountValue);
    }

    return {
      success: true,
      discount,
      discountType: coupon.discountType,
    };
  } catch (error) {
    console.error("Coupon validation error:", error);
    return { success: false, error: "Failed to validate coupon" };
  }
}

/** Validate cart items against stock */
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

/** Place order with coupon support */
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

  // Handle coupon
  const couponCode = formData.get("couponCode") as string | null;
  let discount = 0;
  let couponId: string | null = null;

  if (couponCode) {
    const couponValidation = await validateCouponAction(couponCode, subtotal);
    if (couponValidation.success && couponValidation.discount) {
      discount = couponValidation.discount;
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
      if (coupon) {
        couponId = coupon.id;
      }
    }
  }

  const tax = Math.round((subtotal - discount) * TAX_RATE);
  const shipping = SHIPPING_FLAT;
  const totalAmount = subtotal - discount + tax + shipping;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          status: "Pending",
          subtotal: new Decimal(subtotal),
          discount: new Decimal(discount),
          tax: new Decimal(tax),
          shipping: new Decimal(shipping),
          totalAmount: new Decimal(totalAmount),
          address: addressStr,
          paymentMethod: "ONLINE",
          paymentStatus: "PENDING",
          couponId,
          couponCode: couponCode?.toUpperCase() || null,
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

      // Decrease stock
      for (const item of cart) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Increment coupon usage
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return order;
    });

    // Create Cashfree payment session
    try {
      // Get the base URL dynamically (works on localhost, Vercel, and custom domains)
      const baseUrl = getBaseUrl();

      const createOrderRequest: any = {
        order_id: order.id,
        order_amount: Number(totalAmount.toFixed(2)),
        order_currency: "INR",
        customer_details: {
          customer_id: userId,
          customer_phone: addressParsed.data.phone,
          customer_name: addressParsed.data.fullName,
          customer_email: session.user.email || "guest@example.com"
        },
        order_meta: {
          return_url: `${baseUrl}/orders/verify?order_id=${order.id}`,
          notify_url: `${baseUrl}/api/cashfree/webhook`
        },
        order_note: "3D Print Order"
      };

      const response = await cashfree.PGCreateOrder(createOrderRequest as any);
      const paymentSessionId = response.data.payment_session_id;

      // Update order with payment session ID
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentSessionId: paymentSessionId,
          paymentStatus: "PENDING"
        }
      });

      revalidatePath("/");
      revalidatePath("/orders");
      revalidatePath("/admin/orders");
      return { success: true, orderId: order.id, paymentSessionId };
    } catch (cfError) {
      console.error("Cashfree Error:", cfError);
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED" }
      });
      return { success: false, error: "Failed to initiate online payment. Please try again." };
    }
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
