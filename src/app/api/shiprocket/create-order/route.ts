import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createOrder, CreateOrderInput } from "@/lib/shiprocket/orders";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    // Fetch the order and details from the DB
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        orderItems: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.shiprocketOrderId) {
      return NextResponse.json(
        { error: "Order already synced", shiprocketOrderId: order.shiprocketOrderId },
        { status: 400 }
      );
    }

    const billing_address = order.address || "No Address Provided"; // Usually JSON or text

    // We can assume Indian orders for now, or parse address.
    // To conform to Shiprocket defaults:
    const baseParams: CreateOrderInput = {
      order_id: order.id,
      order_date: order.createdAt.toISOString().replace("T", " ").substring(0, 16),
      billing_customer_name: order.user.name || "Customer",
      billing_last_name: "",
      billing_address: billing_address.substring(0, 100),
      billing_address_2: "",
      billing_city: "Chennai", // placeholder or parse from address
      billing_pincode: "600001", // placeholder
      billing_state: "Tamil Nadu", // placeholder
      billing_country: "India",
      billing_email: order.user.email,
      billing_phone: order.user.phone || "9999999999",
      shipping_is_billing: true,
      shipping_customer_name: order.user.name || "Customer",
      shipping_email: order.user.email,
      shipping_phone: order.user.phone || "9999999999",
      
      order_items: order.orderItems.map((item: any) => ({
        name: item.product.name,
        sku: item.product.id,
        units: item.quantity,
        selling_price: Number(item.price),
        tax: 0,
        discount: 0,
      })),
      
      payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
      pickup_location: "Primary",
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      sub_total: Number(order.totalAmount),
      total_discount: Number(order.discount),
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
    };

    // Create order on Shiprocket
    const shiprocketResponse = await createOrder(baseParams);

    // Update DB with Shiprocket Order ID and Shipment ID
    if (shiprocketResponse.order_id) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          shiprocketOrderId: shiprocketResponse.order_id.toString(),
          shiprocketShipmentId: shiprocketResponse.shipment_id?.toString() || null,
        },
      });

      return NextResponse.json({
        success: true,
        data: shiprocketResponse,
      });
    }

    return NextResponse.json({ error: "Failed to create order on Shiprocket", details: shiprocketResponse }, { status: 500 });

  } catch (error: any) {
    console.error("Shiprocket Create Order Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
