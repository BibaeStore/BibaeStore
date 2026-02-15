// ============================================================
// Bibae Store - Email HTML Templates
// ============================================================

const BRAND_GOLD = '#C5A059';
const BRAND_BLACK = '#1a1a1a';
const WHATSAPP_LINK = 'https://wa.me/923348438007';
const WEBSITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bibaestore.com';

// --------------------------------------------------
// Shared layout wrapper
// --------------------------------------------------

function baseLayout(bodyContent: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; line-height: 1.6; color: ${BRAND_BLACK}; margin: 0; padding: 0; background-color: #f7f7f7; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #f0f0f0; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
    .header { background-color: ${BRAND_GOLD}; padding: 48px 40px; text-align: center; }
    .brand { font-size: 26px; font-weight: 900; letter-spacing: 5px; text-transform: uppercase; margin: 0; color: #ffffff; }
    .brand-sub { font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; margin-top: 6px; color: rgba(255,255,255,0.8); }
    .content { padding: 48px 40px; }
    .title { font-size: 24px; font-weight: 800; color: ${BRAND_BLACK}; margin: 0 0 8px 0; line-height: 1.3; }
    .subtitle { font-size: 14px; color: #888; margin: 0 0 32px 0; }
    .text { font-size: 15px; color: #444; margin-bottom: 24px; }
    .highlight-box { background: #faf8f3; border: 1px solid #f0ead8; border-radius: 16px; padding: 24px; margin-bottom: 28px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0; }
    .info-row:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
    .label { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .value { font-size: 14px; font-weight: 700; color: ${BRAND_BLACK}; }
    .item-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .item-table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; padding: 8px 0; border-bottom: 2px solid #f0f0f0; font-weight: 600; }
    .item-table td { font-size: 14px; color: ${BRAND_BLACK}; padding: 12px 0; border-bottom: 1px solid #f8f8f8; }
    .item-table .item-name { font-weight: 600; }
    .item-table .item-qty { color: #888; text-align: center; }
    .item-table .item-price { font-weight: 700; text-align: right; }
    .total-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-top: 2px solid ${BRAND_GOLD}; margin-top: 8px; }
    .total-label { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${BRAND_BLACK}; }
    .total-value { font-size: 22px; font-weight: 900; color: ${BRAND_GOLD}; }
    .btn-primary { display: inline-block; padding: 16px 40px; background-color: ${BRAND_BLACK}; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; margin-right: 12px; margin-bottom: 12px; }
    .btn-whatsapp { display: inline-block; padding: 16px 40px; background-color: #25D366; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
    .btn-group { margin-top: 32px; text-align: center; }
    .divider { height: 1px; background: #f0f0f0; margin: 32px 0; }
    .note { font-size: 13px; color: #999; font-style: italic; margin-top: 24px; }
    .status-badge { display: inline-block; padding: 6px 16px; border-radius: 100px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 24px; }
    .badge-success { background: #e8f8ef; color: #1b9e4b; }
    .badge-warning { background: #fef6e8; color: #c48a12; }
    .badge-error { background: #fde8e8; color: #c41212; }
    .badge-info { background: #e8f0fe; color: #1256c4; }
    .footer { padding: 32px 40px; text-align: center; font-size: 11px; color: #bbb; border-top: 1px solid #f8f8f8; background: #fafafa; }
    .footer a { color: ${BRAND_GOLD}; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1 class="brand">BIBAE</h1>
      <p class="brand-sub">Store</p>
    </div>
    ${bodyContent}
    <div class="footer">
      <p>Need help? <a href="${WHATSAPP_LINK}">Chat with us on WhatsApp</a> or visit <a href="${WEBSITE_URL}">bibaestore.com</a></p>
      <p style="margin-top: 12px;">&copy; ${new Date().getFullYear()} BIBAE STORE. ALL RIGHTS RESERVED.</p>
    </div>
  </div>
</body>
</html>`;
}

// --------------------------------------------------
// Helper: render items table
// --------------------------------------------------

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

function renderItemsTable(items: OrderItem[]): string {
  const rows = items
    .map(
      (item) => `
    <tr>
      <td class="item-name">${item.name}</td>
      <td class="item-qty">${item.quantity}</td>
      <td class="item-price">${Number(item.price).toLocaleString()} PKR</td>
    </tr>`
    )
    .join('');

  return `
  <table class="item-table">
    <thead>
      <tr>
        <th>Product</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Price</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>`;
}

// ============================================================
// 1. Order Placed (COD + Bank Transfer variants)
// ============================================================

interface OrderPlacedData {
  name: string;
  trackingNumber: string;
  totalAmount: number;
  paymentMethod: string; // 'cod' | 'bank_transfer' | string
  items: OrderItem[];
}

export function orderPlacedTemplate(data: OrderPlacedData): string {
  const { name, trackingNumber, totalAmount, paymentMethod, items } = data;

  const isCOD =
    paymentMethod.toLowerCase() === 'cod' ||
    paymentMethod.toLowerCase() === 'cash_on_delivery';

  const paymentLabel = isCOD ? 'Cash on Delivery' : 'Bank Transfer';

  const paymentInstructions = isCOD
    ? `<div class="highlight-box">
        <p style="margin:0; font-size:14px; color:#444;">
          <strong>Payment:</strong> You will pay <strong>${Number(totalAmount).toLocaleString()} PKR</strong> in cash when you receive your order. Please have the exact amount ready for the delivery agent.
        </p>
      </div>`
    : `<div class="highlight-box">
        <p style="margin:0 0 12px 0; font-size:14px; color:#444;">
          <strong>Payment:</strong> Please complete your bank transfer of <strong>${Number(totalAmount).toLocaleString()} PKR</strong> and send proof of payment via WhatsApp. Your order will be confirmed once the payment is verified.
        </p>
        <a href="${WHATSAPP_LINK}" class="btn-whatsapp" style="display:inline-block; margin-top:8px;">Send Payment Proof</a>
      </div>`;

  const body = `
    <div class="content">
      <span class="status-badge badge-success">Order Received</span>
      <h2 class="title">Thank You, ${name}!</h2>
      <p class="subtitle">Your order has been placed successfully.</p>

      <div class="highlight-box">
        <div class="info-row">
          <span class="label">Tracking Number</span>
          <span class="value">${trackingNumber}</span>
        </div>
        <div class="info-row">
          <span class="label">Payment Method</span>
          <span class="value">${paymentLabel}</span>
        </div>
      </div>

      ${renderItemsTable(items)}

      <div class="total-row">
        <span class="total-label">Total</span>
        <span class="total-value">${Number(totalAmount).toLocaleString()} PKR</span>
      </div>

      <div class="divider"></div>

      ${paymentInstructions}

      <p class="text">We will process your order shortly. You will receive an email at each step of the way.</p>

      <div class="btn-group">
        <a href="${WEBSITE_URL}" class="btn-primary">Visit Store</a>
        <a href="${WHATSAPP_LINK}" class="btn-whatsapp">WhatsApp Us</a>
      </div>
    </div>`;

  return baseLayout(body);
}

// ============================================================
// 2. Order Confirmed
// ============================================================

interface OrderConfirmedData {
  name: string;
  trackingNumber: string;
}

export function orderConfirmedTemplate(data: OrderConfirmedData): string {
  const { name, trackingNumber } = data;

  const body = `
    <div class="content">
      <span class="status-badge badge-success">Confirmed</span>
      <h2 class="title">Your Order is Confirmed, ${name}!</h2>
      <p class="subtitle">Great news — we have confirmed your order and it is now being prepared.</p>

      <div class="highlight-box">
        <div class="info-row">
          <span class="label">Tracking Number</span>
          <span class="value">${trackingNumber}</span>
        </div>
        <div class="info-row">
          <span class="label">Status</span>
          <span class="value" style="color: #1b9e4b;">Confirmed &amp; Preparing</span>
        </div>
      </div>

      <p class="text">Your order is now being carefully prepared for dispatch. We will notify you as soon as it is on its way.</p>

      <div class="btn-group">
        <a href="${WEBSITE_URL}" class="btn-primary">Visit Store</a>
        <a href="${WHATSAPP_LINK}" class="btn-whatsapp">WhatsApp Us</a>
      </div>

      <p class="note">If you have any questions about your order, feel free to reach out via WhatsApp.</p>
    </div>`;

  return baseLayout(body);
}

// ============================================================
// 3. Order Dispatched
// ============================================================

interface OrderDispatchedData {
  name: string;
  trackingNumber: string;
  dispatchNote?: string;
}

export function orderDispatchedTemplate(data: OrderDispatchedData): string {
  const { name, trackingNumber, dispatchNote } = data;

  const noteSection = dispatchNote
    ? `<div class="highlight-box" style="border-color: #d4e8ff; background: #f0f6ff;">
        <p style="margin:0; font-size:14px; color:#444;">
          <strong>Note from Dispatch:</strong> ${dispatchNote}
        </p>
      </div>`
    : '';

  const body = `
    <div class="content">
      <span class="status-badge badge-info">Dispatched</span>
      <h2 class="title">Your Order is On Its Way, ${name}!</h2>
      <p class="subtitle">Your package has been dispatched and is heading to you.</p>

      <div class="highlight-box">
        <div class="info-row">
          <span class="label">Tracking Number</span>
          <span class="value">${trackingNumber}</span>
        </div>
        <div class="info-row">
          <span class="label">Status</span>
          <span class="value" style="color: #1256c4;">In Transit</span>
        </div>
      </div>

      ${noteSection}

      <p class="text">Your order has been handed over to the delivery service. Please keep your phone nearby so the delivery agent can reach you upon arrival.</p>

      <div class="btn-group">
        <a href="${WEBSITE_URL}" class="btn-primary">Visit Store</a>
        <a href="${WHATSAPP_LINK}" class="btn-whatsapp">WhatsApp Us</a>
      </div>

      <p class="note">Need to reschedule delivery? Contact us on WhatsApp and we will help.</p>
    </div>`;

  return baseLayout(body);
}

// ============================================================
// 4. Order Delivered
// ============================================================

interface OrderDeliveredData {
  name: string;
  trackingNumber: string;
}

export function orderDeliveredTemplate(data: OrderDeliveredData): string {
  const { name, trackingNumber } = data;

  const body = `
    <div class="content">
      <span class="status-badge badge-success">Delivered</span>
      <h2 class="title">Your Order Has Arrived, ${name}!</h2>
      <p class="subtitle">We hope you love your new items.</p>

      <div class="highlight-box">
        <div class="info-row">
          <span class="label">Tracking Number</span>
          <span class="value">${trackingNumber}</span>
        </div>
        <div class="info-row">
          <span class="label">Status</span>
          <span class="value" style="color: #1b9e4b;">Delivered</span>
        </div>
      </div>

      <p class="text">Your order has been successfully delivered. We truly hope you enjoy every piece. If anything is not perfect, please do not hesitate to reach out to us.</p>

      <p class="text">Your satisfaction means the world to us. We would love to hear about your experience!</p>

      <div class="btn-group">
        <a href="${WEBSITE_URL}" class="btn-primary">Shop Again</a>
        <a href="${WHATSAPP_LINK}" class="btn-whatsapp">Share Feedback</a>
      </div>

      <p class="note">Thank you for choosing Bibae Store. We look forward to seeing you again.</p>
    </div>`;

  return baseLayout(body);
}

// ============================================================
// 5. Payment Rejected
// ============================================================

interface PaymentRejectedData {
  name: string;
  trackingNumber: string;
}

export function paymentRejectedTemplate(data: PaymentRejectedData): string {
  const { name, trackingNumber } = data;

  const body = `
    <div class="content">
      <span class="status-badge badge-error">Payment Issue</span>
      <h2 class="title">Payment Could Not Be Verified, ${name}</h2>
      <p class="subtitle">There was an issue with the payment for your order.</p>

      <div class="highlight-box" style="border-color: #fde0e0; background: #fef5f5;">
        <div class="info-row">
          <span class="label">Tracking Number</span>
          <span class="value">${trackingNumber}</span>
        </div>
        <div class="info-row">
          <span class="label">Status</span>
          <span class="value" style="color: #c41212;">Payment Rejected</span>
        </div>
      </div>

      <p class="text">Unfortunately, we were unable to verify the payment for your order. This could be due to an unclear transfer receipt, insufficient funds, or a mismatch in details.</p>

      <p class="text"><strong>What to do next:</strong> Please contact us on WhatsApp with a clear copy of your payment proof so we can resolve this as quickly as possible.</p>

      <div class="btn-group">
        <a href="${WHATSAPP_LINK}" class="btn-whatsapp">Contact Us on WhatsApp</a>
        <a href="${WEBSITE_URL}" class="btn-primary">Visit Store</a>
      </div>

      <p class="note">If you believe this is an error, please reach out to us and we will investigate immediately.</p>
    </div>`;

  return baseLayout(body);
}

// ============================================================
// 6. Cancellation Approved
// ============================================================

interface CancellationApprovedData {
  name: string;
  trackingNumber: string;
}

export function cancellationApprovedTemplate(data: CancellationApprovedData): string {
  const { name, trackingNumber } = data;

  const body = `
    <div class="content">
      <span class="status-badge badge-warning">Cancelled</span>
      <h2 class="title">Your Cancellation Has Been Approved, ${name}</h2>
      <p class="subtitle">Your order has been successfully cancelled.</p>

      <div class="highlight-box">
        <div class="info-row">
          <span class="label">Tracking Number</span>
          <span class="value">${trackingNumber}</span>
        </div>
        <div class="info-row">
          <span class="label">Status</span>
          <span class="value" style="color: #c48a12;">Cancelled</span>
        </div>
      </div>

      <p class="text">We have processed your cancellation request. If a payment was made, a refund will be issued according to our refund policy.</p>

      <p class="text">We are sorry to see this order go. If there is anything we can do to improve your experience, please let us know.</p>

      <div class="btn-group">
        <a href="${WEBSITE_URL}" class="btn-primary">Continue Shopping</a>
        <a href="${WHATSAPP_LINK}" class="btn-whatsapp">WhatsApp Us</a>
      </div>

      <p class="note">We hope to serve you again in the future.</p>
    </div>`;

  return baseLayout(body);
}

// ============================================================
// 7. Cancellation Request — Admin Notification
// ============================================================

interface CancellationRequestAdminData {
  customerName: string;
  trackingNumber: string;
  reason: string;
}

export function cancellationRequestAdminTemplate(data: CancellationRequestAdminData): string {
  const { customerName, trackingNumber, reason } = data;

  const body = `
    <div class="content">
      <span class="status-badge badge-error">Action Required</span>
      <h2 class="title">Cancellation Request Received</h2>
      <p class="subtitle">A customer has requested to cancel their order.</p>

      <div class="highlight-box" style="border-color: #fde0e0; background: #fef5f5;">
        <div class="info-row">
          <span class="label">Customer</span>
          <span class="value">${customerName}</span>
        </div>
        <div class="info-row">
          <span class="label">Tracking Number</span>
          <span class="value">${trackingNumber}</span>
        </div>
      </div>

      <div class="highlight-box">
        <p style="margin:0 0 8px 0;" class="label">Reason for Cancellation</p>
        <p style="margin:0; font-size: 15px; color: ${BRAND_BLACK}; font-weight: 500; line-height: 1.6;">${reason}</p>
      </div>

      <p class="text">Please review this request and take appropriate action in the admin dashboard.</p>

      <div class="btn-group">
        <a href="${WEBSITE_URL}/admin/orders" class="btn-primary">Open Dashboard</a>
      </div>
    </div>`;

  return baseLayout(body);
}
