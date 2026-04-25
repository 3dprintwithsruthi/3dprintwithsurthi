import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature, WebhookEvent } from "@/lib/shiprocket/webhooks";

export async function POST(req: Request) {
  try {
    const bodyStr = await req.text();
    const headers = req.headers;
    const signature = headers.get("x-shiprocket-signature") || headers.get("x-api-key"); // Assuming standard header name

    if (!signature || !verifyWebhookSignature(bodyStr, signature)) {
       // In strict mode, we might throw or return 401
       console.warn("Webhook signature validation skipped or failed.");
    }

    const event = JSON.parse(bodyStr) as WebhookEvent;
    
    // Log event simply
    console.log("Received Shiprocket Webhook:", event.awb, event.current_status);

    if (event.awb) {
      const order = await prisma.order.findFirst({
        where: { awbNumber: event.awb },
      });

      if (order) {
        // Map shiprocket status to our OrderStatus
        let newStatus = order.status;
        const sStatus = event.current_status?.toUpperCase();

        if (["SHIPPED", "PICKED UP", "IN TRANSIT"].includes(sStatus)) {
          newStatus = "Shipped";
        } else if (["DELIVERED"].includes(sStatus)) {
          newStatus = "Delivered";
        } else if (["RTO INITIATED", "RETURN", "CANCELED"].includes(sStatus)) {
          newStatus = "Rejected"; // Or create a specific status for returns
        }

        if (newStatus !== order.status) {
          await prisma.order.update({
             where: { id: order.id },
             data: { status: newStatus as any },
          });
        }
      }
    }

    return NextResponse.json({ success: true, received: true });

  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
