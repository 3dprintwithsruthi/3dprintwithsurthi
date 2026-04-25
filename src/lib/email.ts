/**
 * Email service – Google Gmail API with OAuth2
 * - Uses order.notifyEmail (entered at checkout) or order.user.email as fallback
 * - Professional, branded subjects using 3DPS order number format
 * - Exponential backoff (3 attempts) with detailed server logging
 * - Sends for: Accepted, InProgress, Shipped, Delivered, Rejected
 */
import { google } from "googleapis";
import type { OrderStatus } from "@prisma/client";
import type { OrderWithItems } from "@/types";
import { formatOrderNumber } from "@/lib/utils";
import {
  generateAcceptedEmail,
  generateInProgressEmail,
  generateShippedEmail,
  generateDeliveredEmail,
  generateGenericStatusEmail,
} from "./email-templates";

// ─────────────────────────────────────────────
// Gmail OAuth2 client factory
// ─────────────────────────────────────────────
function createGmailClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      `[Gmail] Missing OAuth2 credentials. Configured: clientId=${!!clientId}, secret=${!!clientSecret}, refreshToken=${!!refreshToken}`
    );
  }

  const OAuth2 = google.auth.OAuth2;
  const auth = new OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground"
  );
  auth.setCredentials({ refresh_token: refreshToken });
  return google.gmail({ version: "v1", auth });
}

// ─────────────────────────────────────────────
// Encode raw MIME email for Gmail API
// ─────────────────────────────────────────────
function buildRawEmail(to: string, from: string, subject: string, html: string): string {
  const mime = [
    `From: "3D Print with Sruthi" <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "",
    html,
  ].join("\r\n");

  return Buffer.from(mime, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// ─────────────────────────────────────────────
// Core send function with retry + logging
// ─────────────────────────────────────────────
async function sendGmail(
  to: string,
  subject: string,
  html: string
): Promise<{ ok: boolean; error?: string }> {
  const senderEmail = process.env.MAIL_FROM || process.env.SMTP_USER;

  if (!senderEmail) {
    console.warn("[Gmail] ⚠️  Skipping — MAIL_FROM not set in environment variables");
    return { ok: false, error: "MAIL_FROM env var not set" };
  }

  const raw = buildRawEmail(to, senderEmail, subject, html);
  const MAX = 3;

  for (let attempt = 1; attempt <= MAX; attempt++) {
    try {
      const gmail = createGmailClient();
      await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw },
      });
      console.log(`[Gmail] ✅ Sent (attempt ${attempt}/${MAX}): "${subject}" → ${to}`);
      return { ok: true };
    } catch (err: any) {
      const msg: string = err?.message || String(err);
      console.error(`[Gmail] ❌ Attempt ${attempt}/${MAX} failed → ${to}: ${msg}`);
      if (attempt === MAX) {
        return { ok: false, error: msg };
      }
      // Exponential backoff: 1s, 2s
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }

  return { ok: false, error: "Max retries exceeded" };
}

// ─────────────────────────────────────────────
// Professional, branded subject lines
// ─────────────────────────────────────────────
function getEmailSubject(status: OrderStatus, orderRef: string): string {
  switch (status) {
    case "Accepted":
      return `Order Confirmed — ${orderRef} | 3D Print with Sruthi`;
    case "InProgress":
      return `Your Order is Being Printed — ${orderRef} | 3D Print with Sruthi`;
    case "Shipped":
      return `Your Order Has Shipped — ${orderRef} | Track Your Package`;
    case "Delivered":
      return `Order Delivered — ${orderRef} | Thank You for Your Purchase`;
    case "Rejected":
      return `Order Update — ${orderRef} | 3D Print with Sruthi`;
    default:
      return `Order Status Update — ${orderRef} | 3D Print with Sruthi`;
  }
}

// ─────────────────────────────────────────────
// Main export — called from order actions
// ─────────────────────────────────────────────
export async function sendOrderStatusEmail(
  order: OrderWithItems,
  newStatus: OrderStatus,
  domain: string = process.env.NEXTAUTH_URL || "https://3dprintwithsruthi.in"
): Promise<{ ok: boolean; error?: string }> {

  // No email for newly created (Pending) orders
  if (newStatus === "Pending") {
    console.log(`[Gmail] ⏭️  Skipping Pending email — order ${order.id}`);
    return { ok: true };
  }

  // Determine recipient: notifyEmail entered at checkout → account email as fallback
  const recipientEmail =
    (order.notifyEmail && order.notifyEmail.trim().length > 0)
      ? order.notifyEmail.trim()
      : order.user?.email;

  if (!recipientEmail) {
    console.error(`[Gmail] ❌ No recipient email for order ${order.id} — cannot send`);
    return { ok: false, error: "No recipient email on order" };
  }

  // Format the 3DPS order reference for use in subject + template
  const orderRef = formatOrderNumber(
    (order as any).orderNumber ?? null,
    order.id
  );

  // Build subject and HTML body
  const subject = getEmailSubject(newStatus, orderRef);
  let html: string;

  switch (newStatus) {
    case "Accepted":
      html = generateAcceptedEmail(order, domain, orderRef);
      break;
    case "InProgress":
      html = generateInProgressEmail(order, domain, orderRef);
      break;
    case "Shipped":
      html = generateShippedEmail(order, domain, orderRef);
      break;
    case "Delivered":
      html = generateDeliveredEmail(order, domain, orderRef);
      break;
    case "Rejected":
      html = generateGenericStatusEmail(order, "Cancelled", domain, orderRef);
      break;
    default:
      html = generateGenericStatusEmail(order, newStatus, domain, orderRef);
      break;
  }

  console.log(
    `[Gmail] 📧 Dispatching: status="${newStatus}" | ref="${orderRef}" | to="${recipientEmail}"`
  );
  return sendGmail(recipientEmail, subject, html);
}
