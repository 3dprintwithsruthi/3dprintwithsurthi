import type { OrderWithItems } from "@/types";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

/**
 * Base Template wrapper
 */
function wrapEmail(content: string, preheader: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Update</title>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 32px 24px; color: #374151; font-size: 16px; line-height: 1.6; }
    .table-wrapper { margin: 24px 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background-color: #f9fafb; padding: 12px 16px; font-size: 14px; font-weight: 600; color: #4b5563; border-bottom: 1px solid #e5e7eb; }
    td { padding: 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151; }
    .total-row { background-color: #f9fafb; font-weight: 700; }
    .btn { display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 24px; text-align: center; }
    .footer { padding: 32px 24px; text-align: center; color: #6b7280; font-size: 14px; background-color: #f9fafb; }
    .preheader { display: none; font-size: 1px; color: #333333; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; }
  </style>
</head>
<body>
  <span class="preheader">${preheader}</span>
  <div style="background-color: #f9fafb; padding: 20px 0;">
    <div class="container">
      <div class="header">
        <h1>3D Print with Sruthi</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>Thank you for shopping with us!</p>
        <p>If you have any questions, reply to this email or contact us at 3dprintwithsruthi@gmail.com</p>
        <p>&copy; ${new Date().getFullYear()} 3D Print with Sruthi. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate Items Table
 */
function buildItemsTable(order: OrderWithItems) {
  const itemsRows = order.orderItems.map((item) => `
    <tr>
      <td>
        <p style="margin:0;font-weight:600">${item.product.name}</p>
        ${item.customInput && Object.keys(item.customInput).length > 0 
          ? `<p style="margin:4px 0 0 0;font-size:12px;color:#6b7280">Custom: ${Object.entries(item.customInput).map(([k,v])=>`${k}: ${v}`).join(', ')}</p>` 
          : ''}
      </td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">${formatPrice(Number(item.price))}</td>
    </tr>
  `).join("");

  return `
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
        <tr class="total-row">
          <td colspan="2" style="text-align:right; border-bottom:none">Total Amount</td>
          <td style="text-align:right; border-bottom:none; color:#111827">${formatPrice(Number(order.totalAmount))}</td>
        </tr>
      </tbody>
    </table>
  </div>
  `;
}

/** Specific Email Generators */

export function generateAcceptedEmail(order: OrderWithItems, domain: string) {
  const content = `
    <h2 style="color:#111827; margin-top:0;">Order Confirmed! 🎉</h2>
    <p>Hi ${order.user.name},</p>
    <p>Thank you for your order! We've received your request and are getting things ready. We'll notify you once it's in progress.</p>
    <div style="background-color:#f3f4f6; padding:16px; border-radius:8px; margin: 24px 0;">
      <p style="margin:0; font-weight:600;">Order ID: <span style="font-family:monospace; color:#4f46e5">#${order.id.slice(-8)}</span></p>
    </div>
    ${buildItemsTable(order)}
    <div style="text-align:center">
      <a href="${domain}/orders" class="btn">View Order Details</a>
    </div>
  `;
  return wrapEmail(content, `Your order #${order.id.slice(-8)} has been confirmed!`);
}

export function generateInProgressEmail(order: OrderWithItems, domain: string) {
  const content = `
    <h2 style="color:#111827; margin-top:0;">We're printing your order! 🖨️</h2>
    <p>Hi ${order.user.name},</p>
    <p>Great news! Your order is currently being prepared. We are carefully monitoring the quality.</p>
    <p>We'll send you another update with tracking details as soon as it's ready to be shipped.</p>
    ${buildItemsTable(order)}
    <div style="text-align:center">
      <a href="${domain}/orders" class="btn">Track Order Status</a>
    </div>
  `;
  return wrapEmail(content, `Your order #${order.id.slice(-8)} is now in progress!`);
}

export function generateShippedEmail(order: OrderWithItems, domain: string) {
  const content = `
    <h2 style="color:#111827; margin-top:0;">Your order is on the way! 🚚</h2>
    <p>Hi ${order.user.name},</p>
    <p>Your pricious order have been securely packaged and dispatched to our delivery partners.</p>
    ${order.awbNumber ? `
    <div style="background-color:#eff6ff; border:1px solid #bfdbfe; padding:20px; border-radius:8px; margin:24px 0; text-align:center;">
      <h3 style="margin:0 0 12px 0; color:#1d4ed8; font-size:18px;">Track Your Package</h3>
      <p style="margin:0 0 4px 0; font-size:14px; color:#3b82f6; text-transform:uppercase; font-weight:700">AWB Number</p>
      <p style="margin:0 0 16px 0; font-size:24px; font-weight:bold; color:#1e3a8a; letter-spacing:1px; font-family:monospace;">${order.awbNumber}</p>
      <p style="margin:0 0 12px 0; color:#475569; font-size:14px; text-align:left;"><strong>How to track:</strong></p>
      <ol style="margin:0 0 16px 0; color:#475569; font-size:14px; padding-left:20px; text-align:left;">
        <li>Visit the ST Courier tracking page.</li>
        <li>Enter your AWB number above.</li>
        <li>View your live status!</li>
      </ol>
      <a href="https://www.stcourier.com/track/shipment" class="btn" style="background-color:#3b82f6; width:100%; box-sizing:border-box; border-radius:6px; margin-top:0;">Track on ST Courier &rarr;</a>
    </div>
    ` : ''}
    <p><strong>Shipping Address:</strong><br/>
    <span style="color:#6b7280">${order.address.replace(/\n/g, '<br/>')}</span></p>
    ${buildItemsTable(order)}
    ${!order.awbNumber ? `
    <div style="text-align:center">
      <a href="${domain}/orders" class="btn">Track Delivery</a>
    </div>
    ` : ''}
  `;
  return wrapEmail(content, `Good news! Your order #${order.id.slice(-8)} has shipped.`);
}

export function generateDeliveredEmail(order: OrderWithItems, domain: string) {
  const content = `
    <h2 style="color:#111827; margin-top:0;">Your order has arrived! 🎁</h2>
    <p>Hi ${order.user.name},</p>
    <p>Your package has been successfully delivered. We hope you love your new products as much as we loved making them for you!</p>
    <p>If you have a moment, we'd greatly appreciate any feedback or photos of your items in action. Just reply to this email!</p>
    ${buildItemsTable(order)}
  `;
  return wrapEmail(content, `Your order #${order.id.slice(-8)} has been delivered!`);
}

export function generateGenericStatusEmail(order: OrderWithItems, status: string, domain: string) {
  const content = `
    <h2 style="color:#111827; margin-top:0;">Order Status Update</h2>
    <p>Hi ${order.user.name},</p>
    <p>Your order <strong>#${order.id.slice(-8)}</strong> has been updated to: <strong style="color:#4f46e5">${status}</strong>.</p>
    ${buildItemsTable(order)}
    <div style="text-align:center">
      <a href="${domain}/orders" class="btn">View Order Details</a>
    </div>
  `;
  return wrapEmail(content, `Update on your order #${order.id.slice(-8)}`);
}
