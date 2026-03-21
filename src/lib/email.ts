/**
 * Email service – Google Gmail API with OAuth2
 * Sends production-ready HTML order status emails to customers
 */
import { google } from "googleapis";
import type { OrderStatus } from "@prisma/client";
import type { OrderWithItems } from "@/types";
import { 
  generateAcceptedEmail, 
  generateInProgressEmail, 
  generateShippedEmail, 
  generateDeliveredEmail, 
  generateGenericStatusEmail 
} from "./email-templates";

// 1. Setup Gmail OAuth2 Client
const OAuth2 = google.auth.OAuth2;

const createTransporter = () => {
  const oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
};

function encodeMessage(message: string): string {
  return Buffer.from(message, 'utf8')
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sendGmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  const SENDER_EMAIL = process.env.MAIL_FROM || process.env.SMTP_USER;
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REFRESH_TOKEN || !SENDER_EMAIL) {
    console.warn("Gmail OAuth2 not fully configured. Missing ENV vars. Skipping email to", to);
    return { ok: true };
  }

  // Proper raw MIME multi-part or direct HTML assembly
  // To avoid boundary complexities for simple emails, we just use Content-Type text/html directly
  const messageParts = [
    "From: \"3D Print with Sruthi\" <" + SENDER_EMAIL + ">",
    "To: " + to,
    "Subject: " + subject,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    "",
    html
  ].join("\r\n");

  const encodedMessage = encodeMessage(messageParts);

  try {
    const gmail = createTransporter();
    
    // Add simple retry logic (Requirement 6 Bonus)
    let attempts = 0;
    while (attempts < 3) {
      try {
        await gmail.users.messages.send({
          userId: "me",
          requestBody: {
            raw: encodedMessage,
          },
        });
        console.log("[Gmail Auto-Mailer] Successfully sent " + subject + " to " + to);
        return { ok: true };
      } catch (sendError: any) {
        attempts++;
        if (attempts >= 3) throw sendError;
        // Exponential backoff
        await new Promise((res) => setTimeout(res, 1000 * attempts));
      }
    }
    return { ok: true };
  } catch (e: any) {
    const errorMsg = e.message || "Unknown Gmail API error";
    console.error("[Gmail Auto-Mailer] Critical Failure:", errorMsg);
    return { ok: false, error: errorMsg };
  }
}

export async function sendOrderStatusEmail(
  order: OrderWithItems,
  newStatus: OrderStatus,
  domain: string = process.env.NEXTAUTH_URL || "https://3dprintwithsruthi.in"
): Promise<{ ok: boolean; error?: string }> {
  
  let html = "";
  let subject = "Order #" + order.id.slice(-8) + " – Status: " + newStatus;

  switch(newStatus) {
    case "Accepted":
      html = generateAcceptedEmail(order, domain);
      subject = "Order Confirmed: #" + order.id.slice(-8);
      break;
    case "InProgress":
      html = generateInProgressEmail(order, domain);
      subject = "We are preparing your order #" + order.id.slice(-8);
      break;
    case "Shipped":
      html = generateShippedEmail(order, domain);
      subject = "Your 3D order #" + order.id.slice(-8) + " has shipped!";
      break;
    case "Delivered":
      html = generateDeliveredEmail(order, domain);
      subject = "Delivered: Order #" + order.id.slice(-8);
      break;
    default:
      html = generateGenericStatusEmail(order, newStatus, domain);
      break;
  }

  // Prevent spamming rejected emails
  if (newStatus === "Rejected" || newStatus === "Pending") return { ok: true };

  return sendGmail(order.user.email, subject, html);
}
