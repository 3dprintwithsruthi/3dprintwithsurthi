/**
 * Email service – Google Gmail API with OAuth2
 * Rebuilt for production reliability:
 *  - Uses order.notifyEmail (customer-provided) OR order.user.email
 *  - Exponential backoff retry (3 attempts)
 *  - Detailed server logs for every send attempt
 *  - Sends on all statuses except "Pending"
 */
import { google } from "googleapis";
import type { OrderStatus } from "@prisma/client";
import type { OrderWithItems } from "@/types";
import {
  generateAcceptedEmail,
  generateInProgressEmail,
  generateShippedEmail,
  generateDeliveredEmail,
  generateGenericStatusEmail,
} from "./email-templates";

function createGmailClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      `[Gmail] Missing OAuth2 env vars. Got: clientId=${!!clientId}, clientSecret=${!!clientSecret}, refreshToken=${!!refreshToken}`
    );
  }

  const OAuth2 = google.auth.OAuth2;
  const oauth2Client = new OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground"
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.gmail({ version: "v1", auth: oauth2Client });
}

function encodeRawEmail(to: string, subject: string, html: string, from: string): string {
  const raw = [
    `From: "3D Print with Sruthi" <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "",
    html,
  ].join("\r\n");

  return Buffer.from(raw, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sendGmail(
  to: string,
  subject: string,
  html: string
): Promise<{ ok: boolean; error?: string }> {
  const senderEmail = process.env.MAIL_FROM || process.env.SMTP_USER;

  if (!senderEmail) {
    console.warn("[Gmail] Skipping — MAIL_FROM / SMTP_USER not set");
    return { ok: false, error: "MAIL_FROM not set" };
  }

  const encodedMessage = encodeRawEmail(to, subject, html, senderEmail);

  const MAX_ATTEMPTS = 3;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const gmail = createGmailClient();
      await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw: encodedMessage },
      });
      console.log(`[Gmail] ✅ Sent "${subject}" → ${to} (attempt ${attempt})`);
      return { ok: true };
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error(`[Gmail] ❌ Attempt ${attempt}/${MAX_ATTEMPTS} failed for ${to}: ${msg}`);
      if (attempt === MAX_ATTEMPTS) {
        return { ok: false, error: msg };
      }
      // Exponential backoff: 1s → 2s → 4s
      await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, attempt - 1)));
    }
  }

  return { ok: false, error: "Max retries exceeded" };
}

/**
 * Main entry point — called by order actions and webhooks.
 * Uses order.notifyEmail if customer specified one at checkout,
 * otherwise falls back to their account email (order.user.email).
 */
export async function sendOrderStatusEmail(
  order: OrderWithItems & { notifyEmail?: string | null },
  newStatus: OrderStatus,
  domain: string = process.env.NEXTAUTH_URL || "https://3dprintwithsruthi.in"
): Promise<{ ok: boolean; error?: string }> {
  // No email needed when an order is first created (Pending)
  if (newStatus === "Pending") {
    console.log(`[Gmail] Skipping — status is Pending for order ${order.id}`);
    return { ok: true };
  }

  // Determine recipient: notifyEmail from checkout form → account email
  const recipientEmail = order.notifyEmail?.trim() || order.user?.email;
  if (!recipientEmail) {
    console.error(`[Gmail] No recipient found for order ${order.id}`);
    return { ok: false, error: "No recipient email on order or user" };
  }

  let html: string;
  let subject: string;

  switch (newStatus) {
    case "Accepted":
      html = generateAcceptedEmail(order, domain);
      subject = `✅ Order Confirmed: #${order.id.slice(-8)} — 3D Print with Sruthi`;
      break;
    case "InProgress":
      html = generateInProgressEmail(order, domain);
      subject = `🖨️ Your order #${order.id.slice(-8)} is being printed!`;
      break;
    case "Shipped":
      html = generateShippedEmail(order, domain);
      subject = `🚚 Your order #${order.id.slice(-8)} has shipped!`;
      break;
    case "Delivered":
      html = generateDeliveredEmail(order, domain);
      subject = `📦 Delivered: Order #${order.id.slice(-8)} — Thank you!`;
      break;
    case "Rejected":
      html = generateGenericStatusEmail(order, "Cancelled", domain);
      subject = `Order #${order.id.slice(-8)} — Status Update`;
      break;
    default:
      html = generateGenericStatusEmail(order, newStatus, domain);
      subject = `Order #${order.id.slice(-8)} — Status: ${newStatus}`;
      break;
  }

  console.log(
    `[Gmail] Dispatching status="${newStatus}" to "${recipientEmail}" for order ${order.id}`
  );
  return sendGmail(recipientEmail, subject, html);
}
