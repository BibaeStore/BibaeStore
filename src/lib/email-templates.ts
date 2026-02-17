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
    .wrapper { max-width: 800px; margin: 20px auto; background: #ffffff; border-radius: 0; overflow: hidden; border: 1px solid #e0e0e0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background-color: ${BRAND_BLACK}; padding: 40px 20px; text-align: center; border-bottom: 4px solid ${BRAND_GOLD}; }
    .brand { font-size: 28px; font-weight: 800; letter-spacing: 6px; text-transform: uppercase; margin: 0; color: #ffffff; }
    .brand-sub { font-size: 11px; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; margin-top: 8px; color: ${BRAND_GOLD}; }
    .content { padding: 40px 30px; }
    .title { font-size: 26px; font-weight: 700; color: ${BRAND_BLACK}; margin: 0 0 12px 0; line-height: 1.3; text-align: center; }
    .subtitle { font-size: 16px; color: #666; margin: 0 0 32px 0; text-align: center; }
    .text { font-size: 15px; color: #444; margin-bottom: 24px; line-height: 1.7; }
    .highlight-box { background: #faf8f3; border: 1px solid #f0ead8; border-radius: 8px; padding: 24px; margin-bottom: 28px; }
    
    /* Table-based layout for reliability in Outlook/Gmail */
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    .info-table td { padding: 8px 0; vertical-align: top; border-bottom: 1px solid #f0f0f0; }
    .info-table tr:last-child td { border-bottom: none; }
    
    .label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .value { font-size: 15px; font-weight: 700; color: ${BRAND_BLACK}; text-align: right; }
    
    .item-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; }
    .item-table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; padding: 12px 0; border-bottom: 2px solid #ddd; font-weight: 600; }
    .item-table td { padding: 16px 0; border-bottom: 1px solid #f0f0f0; color: ${BRAND_BLACK}; }
    .item-table .item-name { font-weight: 600; }
    .item-table .item-qty { color: #666; text-align: center; }
    .item-table .item-price { font-weight: 700; text-align: right; }
    
    .total-table { width: 100%; border-collapse: collapse; margin-top: 12px; border-top: 2px solid ${BRAND_GOLD}; }
    .total-table td { padding: 16px 0; }
    .total-label { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${BRAND_BLACK}; }
    .total-value { font-size: 24px; font-weight: 800; color: ${BRAND_GOLD}; text-align: right; }
    
    .btn-container { text-align: center; margin: 32px 0; }
    .btn-primary { display: inline-block; padding: 14px 32px; background-color: ${BRAND_BLACK}; color: #ffffff !important; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0 6px 12px 0; }
    .btn-whatsapp { display: inline-block; padding: 14px 32px; background-color: #25D366; color: #ffffff !important; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 6px; }
    
    .divider { height: 1px; background: #eeeeee; margin: 32px 0; }
    .note { font-size: 13px; color: #999; font-style: italic; margin-top: 24px; text-align: center; }
    
    .status-badge { display: block; width: fit-content; margin: 0 auto 16px auto; padding: 6px 16px; border-radius: 100px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; text-align: center; }
    .badge-success { background: #e8f8ef; color: #1b9e4b; }
    .badge-warning { background: #fef6e8; color: #c48a12; }
    .badge-error { background: #fde8e8; color: #c41212; }
    .badge-info { background: #e8f0fe; color: #1256c4; }
    
    .footer { padding: 40px 20px; text-align: center; font-size: 12px; color: #999; background: #f9f9f9; border-top: 1px solid #eee; }
    .footer a { color: ${BRAND_GOLD}; text-decoration: none; margin: 0 8px; }
    .footer-links { margin-bottom: 20px; }
    
    @media only screen and (max-width: 600px) {
      .wrapper { width: 100% !important; margin: 0 !important; border-radius: 0 !important; border: none !important; }
      .content { padding: 24px !important; }
      .header { padding: 32px 20px !important; }
      .btn-primary, .btn-whatsapp { display: block !important; width: 100% !important; margin: 0 0 12px 0 !important; box-sizing: border-box !important; text-align: center !important; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1 class="brand">BIBAE</h1>
      <p class="brand-sub">Premium Boutique</p>
    </div>
    ${bodyContent}
    <div class="footer">
      <div class="footer-links">
        <a href="${WEBSITE_URL}/terms">Terms & Conditions</a> |
        <a href="${WEBSITE_URL}/privacy-policy">Privacy Policy</a> |
        <a href="${WHATSAPP_LINK}">Support</a>
      </div>
      <p>&copy; ${new Date().getFullYear()} BIBAE STORE. All rights reserved.</p>
      <p style="margin-top:8px; font-size: 11px; color: #ccc;">You are receiving this email because you made a purchase or signed up at Bibae Store.</p>
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
        <th style="text-align:center; width: 50px;">Qty</th>
        <th style="text-align:right; width: 100px;">Price</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>`;
}

// --------------------------------------------------
// Helper: Render Info Row (Table based)
// --------------------------------------------------
function renderInfoRow(label: string, value: string, color?: string): string {
  const style = color ? `color: ${color};` : '';
  return `
    <tr>
      <td class="label">${label}</td>
      <td class="value" style="${style}">${value}</td>
    </tr>
  `;
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
          <strong>Payment Instruction:</strong> Please have exact cash of <strong>${Number(totalAmount).toLocaleString()} PKR</strong> ready for the courier.
        </p>
      </div>`
    : `<div class="highlight-box">
        <p style="margin:0 0 12px 0; font-size:14px; color:#444;">
          <strong>Payment Required:</strong> Please transfer <strong>${Number(totalAmount).toLocaleString()} PKR</strong> to our bank account and share the receipt on WhatsApp to confirm your order.
        </p>
        <div style="text-align:center;">
           <a href="${WHATSAPP_LINK}" class="btn-whatsapp">Upload Receipt</a>
        </div>
      </div>`;

  const body = `
    <div class="content">
      <span class="status-badge badge-success">Order Received</span>
      <h2 class="title">Thank You, ${name}!</h2>
      <p class="subtitle">We've received your order and are getting it ready.</p>

      <div class="highlight-box">
        <table class="info-table">
           ${renderInfoRow('Order ID / Tracking', trackingNumber)}
           ${renderInfoRow('Payment Method', paymentLabel)}
        </table>
      </div>

      ${renderItemsTable(items)}

      <table class="total-table">
        <tr>
          <td class="total-label">Total Amount</td>
          <td class="total-value">${Number(totalAmount).toLocaleString()} PKR</td>
        </tr>
      </table>

      <div class="divider"></div>

      ${paymentInstructions}

      <div class="btn-container">
        <a href="${WEBSITE_URL}" class="btn-primary">Visit Store</a>
        <a href="${WHATSAPP_LINK}" class="btn-whatsapp">WhatsApp Support</a>
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
  items?: OrderItem[]; // Optional for confirmation
}

export function orderConfirmedTemplate(data: OrderConfirmedData): string {
  const { name, trackingNumber } = data;

  const body = `
    <div class="content">
      <span class="status-badge badge-success">Confirmed</span>
      <h2 class="title">Order Confirmed!</h2>
      <p class="subtitle">Hi ${name}, your order has been verified and is now being processed.</p>

      <div class="highlight-box">
        <table class="info-table">
           ${renderInfoRow('Order ID', trackingNumber)}
           ${renderInfoRow('Status', 'Preparing for Dispatch', '#1b9e4b')}
        </table>
      </div>

      <p class="text">Our team is carefully packing your items. You will receive another notification once your package is handed over to the courier.</p>

      <div class="btn-container">
        <a href="${WEBSITE_URL}" class="btn-primary">Shop More</a>
        <a href="${WHATSAPP_LINK}" class="btn-whatsapp">Contact Us</a>
      </div>
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
          <strong>Courier Note:</strong> ${dispatchNote}
        </p>
      </div>`
    : '';

  const body = `
    <div class="content">
      <span class="status-badge badge-info">On The Way</span>
      <h2 class="title">Your Order is Dispatched!</h2>
      <p class="subtitle">Hi ${name}, good news! Your shipment is on its way to you.</p>

      <div class="highlight-box">
        <table class="info-table">
           ${renderInfoRow('In Transit', trackingNumber)}
           ${renderInfoRow('Delivery Status', 'Shipped', '#1256c4')}
        </table>
      </div>

      ${noteSection}

      <p class="text">Please keep your phone active to ensure smooth delivery. The courier may contact you upon arrival.</p>

      <div class="btn-container">
        <a href="${WEBSITE_URL}" class="btn-primary">Visit Website</a>
        <a href="${WHATSAPP_LINK}" class="btn-whatsapp">Track Order</a>
      </div>

      <p class="note">Need to reschedule? Reply to this email or WhatsApp us.</p>
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
      <h2 class="title">Package Delivered</h2>
      <p class="subtitle">Hi ${name}, your order has been successfully delivered.</p>

      <div class="highlight-box">
        <table class="info-table">
           ${renderInfoRow('Order #', trackingNumber)}
           ${renderInfoRow('Status', 'Delivered Successfully', '#1b9e4b')}
        </table>
      </div>

      <p class="text">We hope you love your purchase! Thank you for choosing Bibae Store for your fashion needs.</p>

      <div class="btn-container">
        <a href="${WEBSITE_URL}" class="btn-primary">Shop Again</a>
        <a href="${WHATSAPP_LINK}" class="btn-whatsapp">Give Feedback</a>
      </div>
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
      <span class="status-badge badge-error">Action Required</span>
      <h2 class="title">Payment Verification Failed</h2>
      <p class="subtitle">Hi ${name}, we encountered an issue with your payment.</p>

      <div class="highlight-box" style="border-color: #fde0e0; background: #fef5f5;">
        <table class="info-table">
           ${renderInfoRow('Order #', trackingNumber)}
           ${renderInfoRow('Issue', 'Payment Rejected', '#c41212')}
        </table>
      </div>

      <p class="text">This usually happens if the screenshot provided was unclear or the transaction ID didn't match. Don't worry, your order is safe!</p>
      
      <p class="text"><strong>Please send a clear proof of payment to our WhatsApp support team to proceed.</strong></p>

      <div class="btn-container">
        <a href="${WHATSAPP_LINK}" class="btn-whatsapp">Contact Support</a>
      </div>
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
      <h2 class="title">Order Cancelled</h2>
      <p class="subtitle">Hi ${name}, your order cancellation request has been processed.</p>

      <div class="highlight-box">
         <table class="info-table">
           ${renderInfoRow('Order #', trackingNumber)}
           ${renderInfoRow('Status', 'Cancelled', '#c48a12')}
        </table>
      </div>

      <p class="text">If you have already made a payment, a refund will be initiated as per our policy. We are sorry to see you go!</p>

      <div class="btn-container">
        <a href="${WEBSITE_URL}" class="btn-primary">Browse New Arrivals</a>
      </div>
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
      <span class="status-badge badge-error">Admin Alert</span>
      <h2 class="title">Cancellation Request</h2>
      <p class="subtitle">A customer wants to cancel their order.</p>

      <div class="highlight-box" style="border-color: #fde0e0; background: #fef5f5;">
        <table class="info-table">
           ${renderInfoRow('Customer', customerName)}
           ${renderInfoRow('Order ID', trackingNumber)}
        </table>
      </div>

      <div class="highlight-box">
        <p style="margin:0 0 8px 0; font-size: 11px; text-transform: uppercase; color: #888;">Reason Given</p>
        <p style="margin:0; font-size: 15px; font-weight: 500;">${reason}</p>
      </div>

      <div class="btn-container">
        <a href="${WEBSITE_URL}/admin/orders" class="btn-primary">Manage Order</a>
      </div>
    </div>`;

  return baseLayout(body);
}
