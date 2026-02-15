/**
 * Email service – Nodemailer with Gmail SMTP
 * Sends HTML order status emails to customer
 */
import nodemailer from "nodemailer";
import type { OrderStatus } from "@prisma/client";
import type { OrderWithItems } from "@/types";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/** Build HTML body for order status email */
function buildOrderEmailHtml(
  order: OrderWithItems,
  newStatus: OrderStatus,
  recipientEmail: string
): string {
  const statusLabel = newStatus.replace(/([A-Z])/g, " $1").trim();
  const itemsRows = order.orderItems
    .map(
      (item) => `
    <tr>
      <td style="padding:8px;border:1px solid #eee">${item.product.name}</td>
      <td style="padding:8px;border:1px solid #eee">${item.quantity}</td>
      <td style="padding:8px;border:1px solid #eee">₹${item.price}</td>
      <td style="padding:8px;border:1px solid #eee">${item.customInput ? JSON.stringify(item.customInput) : "-"}</td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Update</title></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:20px;border-radius:12px;margin-bottom:20px">
    <h1 style="margin:0">3D Print with Sruthi</h1>
    <p style="margin:8px 0 0 0;opacity:0.9">Order status update</p>
  </div>
  <p>Hi ${order.user.name},</p>
  <p>Your order <strong>#${order.id.slice(-8)}</strong> status has been updated to: <strong>${statusLabel}</strong>.</p>
  <h3>Order details</h3>
  <table style="width:100%;border-collapse:collapse">
    <thead>
      <tr style="background:#f5f5f5">
        <th style="padding:8px;border:1px solid #eee;text-align:left">Product</th>
        <th style="padding:8px;border:1px solid #eee">Qty</th>
        <th style="padding:8px;border:1px solid #eee">Price</th>
        <th style="padding:8px;border:1px solid #eee;text-align:left">Custom input</th>
      </tr>
    </thead>
    <tbody>${itemsRows}</tbody>
  </table>
  <p style="margin-top:16px"><strong>Total: ₹${order.totalAmount}</strong></p>
  <p style="margin-top:16px"><strong>Shipping address:</strong><br/>${order.address.replace(/\n/g, "<br/>")}</p>
  <p style="margin-top:24px;color:#666;font-size:14px">Thank you for shopping with us.</p>
</body>
</html>`;
}

/**
 * Send order status update email to the order's user
 * Called on every status change by admin
 */
export async function sendOrderStatusEmail(
  order: OrderWithItems,
  newStatus: OrderStatus
): Promise<{ ok: boolean; error?: string }> {
  const to = order.user.email;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP not configured; skipping email to", to);
    return { ok: true };
  }
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
      to,
      subject: `Order #${order.id.slice(-8)} – Status: ${newStatus}`,
      html: buildOrderEmailHtml(order, newStatus, to),
    });
    return { ok: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Unknown error";
    console.error("sendOrderStatusEmail failed:", error);
    return { ok: false, error };
  }
}
