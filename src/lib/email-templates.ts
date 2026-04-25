import type { OrderWithItems } from "@/types";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

/**
 * Base Template wrapper
 */
function wrapEmail(content: string, preheader: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Update</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .wrapper { background-color: #f4f4f5; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .header { padding: 40px 32px; text-align: center; border-bottom: 1px solid #f4f4f5; }
    .header h1 { color: #18181b; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; }
    .content { padding: 40px 32px; color: #3f3f46; font-size: 16px; line-height: 1.6; }
    .table-wrapper { margin: 32px 0; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background-color: #fafafa; padding: 14px 16px; font-size: 13px; font-weight: 600; color: #71717a; border-bottom: 1px solid #e4e4e7; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 16px; border-bottom: 1px solid #e4e4e7; font-size: 15px; color: #27272a; }
    .total-row td { background-color: #fafafa; font-weight: 600; font-size: 16px; border-bottom: none; }
    .btn { display: inline-block; background-color: #000000; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 24px; text-align: center; font-size: 15px; transition: background-color 0.2s; }
    .btn:hover { background-color: #27272a; }
    .footer { padding: 32px; text-align: center; color: #a1a1aa; font-size: 13px; background-color: #fafafa; border-top: 1px solid #e4e4e7; line-height: 1.5; }
    .preheader { display: none; font-size: 1px; color: #333333; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; }
    .highlight-box { background-color: #fafafa; border: 1px solid #e4e4e7; padding: 20px; border-radius: 8px; margin: 24px 0; }
  </style>
</head>
<body>
  <span class="preheader">${preheader}</span>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>3D Print with Sruthi</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p style="margin: 0 0 8px 0;">Thank you for your business!</p>
        <p style="margin: 0 0 16px 0;">If you have any questions, reply to this email or contact us at <a href="mailto:3dprintwithsruthi@gmail.com" style="color: #000000; text-decoration: underline;">3dprintwithsruthi@gmail.com</a></p>
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} 3D Print with Sruthi. All rights reserved.</p>
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

export function generateAcceptedEmail(order: OrderWithItems, domain: string, orderRef: string) {
  const content = `
    <h2 style="color:#18181b; margin-top:0; font-size: 24px;">Order Confirmed ✓</h2>
    <p>Hi ${order.user.name},</p>
    <p>Thank you for your purchase. We have successfully received your order and our team is preparing it with care. You will receive another update once production begins.</p>
    
    <div class="highlight-box">
      <p style="margin:0; color:#71717a; font-size:13px; text-transform:uppercase; font-weight:600; letter-spacing:0.05em;">Order Reference</p>
      <p style="margin:4px 0 0 0; font-size:22px; font-weight:800; color:#18181b; font-family: monospace; letter-spacing: 1px;">${orderRef}</p>
    </div>
    
    <h3 style="color:#18181b; margin:32px 0 16px 0; font-size:18px;">Order Summary</h3>
    ${buildItemsTable(order)}
    
    <div style="text-align:center; margin-top: 32px;">
      <a href="${domain}/orders" class="btn">View Order Status</a>
    </div>
  `;
  return wrapEmail(content, `Your order ${orderRef} has been confirmed — 3D Print with Sruthi`);
}

export function generateInProgressEmail(order: OrderWithItems, domain: string, orderRef: string) {
  const content = `
    <h2 style="color:#18181b; margin-top:0; font-size: 24px;">Your Order is Being Printed 🖨️</h2>
    <p>Hi ${order.user.name},</p>
    <p>Your 3D prints for order <strong>${orderRef}</strong> are now in active production. We are carefully monitoring quality at every stage to ensure your items meet our highest standards.</p>
    <p>We will notify you with tracking details the moment your package is ready to ship.</p>
    
    ${buildItemsTable(order)}
    
    <div style="text-align:center; margin-top: 32px;">
      <a href="${domain}/orders" class="btn">Check Order Progress</a>
    </div>
  `;
  return wrapEmail(content, `Your order ${orderRef} is now in production — 3D Print with Sruthi`);
}

export function generateShippedEmail(order: OrderWithItems, domain: string, orderRef: string) {
  const content = `
    <h2 style="color:#18181b; margin-top:0; font-size: 24px;">Your Order is On Its Way 🚚</h2>
    <p>Hi ${order.user.name},</p>
    <p>Excellent news! Order <strong>${orderRef}</strong> has been securely packaged and dispatched to our delivery partner.
    
    ${order.awbNumber ? `
    <div class="highlight-box" style="text-align:center; background-color: #fafafa; border-color: #e4e4e7;">
      <p style="margin:0 0 8px 0; font-size:13px; color:#71717a; text-transform:uppercase; font-weight:600; letter-spacing:0.05em;">Tracking Number (AWB)</p>
      <p style="margin:0 0 20px 0; font-size:28px; font-weight:800; color:#18181b; letter-spacing:1px; font-family:monospace;">${order.awbNumber}</p>
      
      <div style="text-align: left; background: #ffffff; padding: 16px; border-radius: 6px; border: 1px solid #e4e4e7;">
        <p style="margin:0 0 8px 0; color:#18181b; font-size:14px; font-weight:600;">How to track your package:</p>
        <ol style="margin:0; padding-left:20px; color:#52525b; font-size:14px; line-height: 1.5;">
          <li>Click the tracking button below to visit the Courier portal.</li>
          <li>Enter your tracking number shown above.</li>
          <li>View your real-time delivery status!</li>
        </ol>
      </div>
      <a href="https://www.stcourier.com/track/shipment" class="btn" style="display:block; margin-top:20px;">Track on Courier Portal</a>
    </div>
    ` : ''}
    
    <div style="margin: 32px 0;">
      <h3 style="color:#18181b; margin:0 0 12px 0; font-size:16px;">Shipping Address</h3>
      <div style="margin:0; color:#52525b; line-height: 1.5; font-size: 14px; background: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #e4e4e7;">
        ${(() => {
          if (!order.address) return "No address provided";
          try {
            const addr = JSON.parse(order.address);
            return `
              <strong style="color:#18181b; font-size: 15px;">${addr.fullName}</strong><br/>
              ${addr.addressLine1}<br/>
              ${addr.addressLine2 ? addr.addressLine2 + '<br/>' : ''}
              ${addr.city}, ${addr.state} ${addr.pincode}<br/>
              <span style="color:#71717a; margin-top: 8px; display: inline-block;">Phone: ${addr.phone}</span>
            `;
          } catch(e) {
            return order.address.replace(/\n/g, '<br/>');
          }
        })()}
      </div>
    </div>
    
    <h3 style="color:#18181b; margin:32px 0 16px 0; font-size:18px;">Items in this shipment</h3>
    ${buildItemsTable(order)}
    
    ${!order.awbNumber ? `
    <div style="text-align:center; margin-top: 32px;">
      <a href="${domain}/orders" class="btn">Track Delivery Status</a>
    </div>
    ` : ''}
  `;
  return wrapEmail(content, `Order ${orderRef} has shipped — track your delivery`);
}

export function generateDeliveredEmail(order: OrderWithItems, domain: string, orderRef: string) {
  const content = `
    <h2 style="color:#18181b; margin-top:0; font-size: 24px;">Your Order Has Arrived 📦</h2>
    <p>Hi ${order.user.name},</p>
    <p>Order <strong>${orderRef}</strong> has been successfully delivered! We hope you love your new 3D printed items as much as we loved making them for you.</p>
    
    <div class="highlight-box">
      <p style="margin:0; color:#3f3f46;">If you have a moment, we'd greatly appreciate any feedback or photos of your items in action. Just reply directly to this email!</p>
    </div>
    
    ${buildItemsTable(order)}
    
    <div style="text-align:center; margin-top: 32px;">
      <a href="${domain}" class="btn">Shop Again</a>
    </div>
  `;
  return wrapEmail(content, `Order ${orderRef} delivered — thank you for shopping with 3D Print with Sruthi`);
}

export function generateGenericStatusEmail(order: OrderWithItems, status: string, domain: string, orderRef: string) {
  const content = `
    <h2 style="color:#18181b; margin-top:0; font-size: 24px;">Order Status Update</h2>
    <p>Hi ${order.user.name},</p>
    <p>There has been an update regarding your recent order.</p>
    
    <div class="highlight-box">
      <p style="margin:0 0 4px 0; color:#71717a; font-size:13px; text-transform:uppercase; font-weight:600; letter-spacing:0.05em;">Order Reference</p>
      <p style="margin:0 0 16px 0; font-size:20px; font-weight:800; color:#18181b; font-family: monospace; letter-spacing: 1px;">${orderRef}</p>
      
      <p style="margin:0 0 4px 0; color:#71717a; font-size:13px; text-transform:uppercase; font-weight:600; letter-spacing:0.05em;">Status</p>
      <p style="margin:0; font-size:20px; font-weight:800; color:#4f46e5;">${status}</p>
    </div>
    
    <h3 style="color:#18181b; margin:32px 0 16px 0; font-size:18px;">Order Details</h3>
    ${buildItemsTable(order)}
    
    <div style="text-align:center; margin-top: 32px;">
      <a href="${domain}/orders" class="btn">View Complete Details</a>
    </div>
  `;
  return wrapEmail(content, `Status update on order ${orderRef} — 3D Print with Sruthi`);
}
