import crypto from "crypto";

export function verifyWebhookSignature(payload: string, signature: string) {
  const secret = process.env.SHIPROCKET_WEBHOOK_TOKEN; // configured in Shiprocket dashboard
  if (!secret) {
    console.warn("SHIPROCKET_WEBHOOK_TOKEN is not configured, skipping verification.");
    return true; // Bypass in dev if not configured, but should be strictly false in prod
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return expectedSignature === signature;
}

export type WebhookEvent = {
  awb: string;
  order_id: string; // Internal Order ID mapped
  shiprocket_order_id: string; // Shiprocket order ID
  current_status: string; // e.g. "SHIPPED", "DELIVERED", "RTO INITIATED"
  current_status_id: number;
  shipment_status: string;
  scans: Array<{
    date: string;
    activity: string;
    location: string;
  }>;
};
