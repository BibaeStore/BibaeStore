// ============================================================
// Habiba Minhas - Email HTML Templates
// ============================================================

const BRAND_GOLD = '#C5A059';
const BRAND_BLACK = '#1a1a1a';
const WHATSAPP_LINK = 'https://wa.me/923120295812';
const WEBSITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://habibaminhas.com';

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
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap');
    
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: ${BRAND_BLACK}; margin: 0; padding: 0; background-color: #fcfcfc; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 0; overflow: hidden; }
    .header { padding: 50px 20px; text-align: center; border-bottom: 1px solid #f0f0f0; }
    .brand { font-family: 'Playfair Display', serif; font-size: 38px; font-weight: 700; letter-spacing: 8px; text-transform: uppercase; margin: 0; color: ${BRAND_BLACK}; }
    .brand-sub { font-size: 10px; font-weight: 700; letter-spacing: 5px; text-transform: uppercase; margin-top: 10px; color: ${BRAND_GOLD}; }
    
    .content { padding: 45px 35px; }
    .title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: ${BRAND_BLACK}; margin: 0 0 15px 0; line-height: 1.2; text-align: center; }
    .subtitle { font-size: 15px; color: #777; margin: 0 0 35px 0; text-align: center; letter-spacing: 0.5px; }
    .text { font-size: 14px; color: #555; margin-bottom: 25px; line-height: 1.8; text-align: center; }
    
    .highlight-box { background: #fafafa; border: 1px solid #f1f1f1; border-radius: 12px; padding: 25px; margin-bottom: 30px; }
    
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
    .info-table td { padding: 10px 0; vertical-align: top; border-bottom: 1px solid #f5f5f5; }
    .info-table tr:last-child td { border-bottom: none; }
    
    .label { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
    .value { font-size: 14px; font-weight: 600; color: ${BRAND_BLACK}; text-align: right; }
    
    .item-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
    .item-table th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; padding: 15px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; }
    .item-table td { padding: 20px 0; border-bottom: 1px solid #f9f9f9; color: ${BRAND_BLACK}; }
    .item-name { font-weight: 600; font-size: 14px; }
    .item-qty { color: #888; text-align: center; }
    .item-price { font-weight: 600; text-align: right; color: ${BRAND_GOLD}; }
    
    .total-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .total-table td { padding: 20px 0; border-top: 1px solid #000; }
    .total-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: ${BRAND_BLACK}; }
    .total-value { font-size: 22px; font-weight: 700; color: ${BRAND_BLACK}; text-align: right; }
    
    .btn-container { text-align: center; margin: 40px 0; }
    .btn-primary { display: inline-block; padding: 16px 36px; background-color: ${BRAND_BLACK}; color: #ffffff !important; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 6px 15px 0; transition: all 0.3s ease; }
    .btn-whatsapp { display: inline-block; padding: 16px 36px; background-color: #ffffff; color: #25D366 !important; text-decoration: none; border: 2px solid #25D366; border-radius: 4px; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 15px 6px; }
    
    .divider { height: 1px; background: #eeeeee; margin: 35px 0; }
    .note { font-size: 12px; color: #aaa; font-style: italic; margin-top: 25px; text-align: center; line-height: 1.6; }
    
    .status-badge { display: block; width: fit-content; margin: 0 auto 20px auto; padding: 6px 18px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; text-align: center; }
    .badge-success { background: #000000; color: #ffffff; }
    .badge-warning { background: #fff8e6; color: ${BRAND_GOLD}; }
    .badge-error { background: #fff5f5; color: #e53e3e; }
    .badge-info { background: #f0f7ff; color: #0066cc; }
    
    .footer { padding: 60px 40px; text-align: center; font-size: 11px; color: #aaa; background: #ffffff; border-top: 1px solid #f5f5f5; }
    .footer a { color: #000; text-decoration: none; margin: 0 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .footer-links { margin-bottom: 25px; }
    
    @media only screen and (max-width: 600px) {
      .content { padding: 30px 20px !important; }
      .brand { font-size: 32px !important; }
      .btn-primary, .btn-whatsapp { display: block !important; width: 100% !important; margin: 0 0 15px 0 !important; box-sizing: border-box !important; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1 class="brand">HABIBA MINHAS</h1>
      <p class="brand-sub">Est. 2026</p>
    </div>
    ${bodyContent}
    <div class="footer">
      <div class="footer-links">
        <a href="${WEBSITE_URL}">Store</a>
        <a href="${WHATSAPP_LINK}">WhatsApp</a>
        <a href="${WEBSITE_URL}/terms">Privacy</a>
      </div>
      <p style="letter-spacing: 1px; margin-bottom: 20px;">&copy; ${new Date().getFullYear()} HABIBA MINHAS. LUXURY COLLECTIONS.</p>
      <div style="border-top: 1px solid #f5f5f5; padding-top: 20px;">
        <p>This is an automated notification from Habiba Minhas.</p>
        <p>Please do not reply directly to this email addresses.</p>
      </div>
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

      <p class="text">We hope you love your purchase! Thank you for choosing Habiba Minhas for your fashion needs.</p>

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

      <div class="highlight-box">
        <table class="info-table">
           ${renderInfoRow('Customer', customerName)}
           ${renderInfoRow('Order ID', trackingNumber)}
        </table>
      </div>

      <div class="highlight-box">
        <p style="margin:0 0 10px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; font-weight: 600;">Reason Given</p>
        <p style="margin:0; font-size: 14px; font-weight: 500; line-height: 1.6; color: ${BRAND_BLACK};">${reason}</p>
      </div>

      <div class="btn-container">
        <a href="${WEBSITE_URL}/admin/orders" class="btn-primary">Manage Order</a>
      </div>
    </div>`;

  return baseLayout(body);
}

// ============================================================
// 8. New Order Admin Notification
// ============================================================

export function newOrderAdminTemplate(data: OrderPlacedData & { customerEmail: string }): string {
  const { name, customerEmail, trackingNumber, totalAmount, paymentMethod, items } = data;

  const body = `
    <div class="content">
      <span class="status-badge badge-success">Admin Alert</span>
      <h2 class="title">New Order Received</h2>
      <p class="subtitle">A new order has been placed on the store.</p>
      
      <div class="highlight-box">
        <table class="info-table">
           ${renderInfoRow('Customer', `${name} (${customerEmail})`)}
           ${renderInfoRow('Order ID', trackingNumber)}
           ${renderInfoRow('Payment', paymentMethod.toUpperCase())}
           ${renderInfoRow('Total', `${Number(totalAmount).toLocaleString()} PKR`, BRAND_GOLD)}
        </table>
      </div>

      <div style="margin-bottom: 25px;">
        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; margin-bottom: 15px; font-weight: 600;">Items Summary</p>
        ${renderItemsTable(items)}
      </div>

      <div class="btn-container">
        <a href="${WEBSITE_URL}/admin/orders" class="btn-primary">View in Dashboard</a>
      </div>
    </div>`;

  return baseLayout(body);
}

// ============================================================
// 9. New User Admin Notification
// ============================================================

interface NewUserData {
  name: string;
  email: string;
  phone: string;
}

export function newUserAdminTemplate(data: NewUserData): string {
  const { name, email, phone } = data;

  const body = `
    <div class="content">
      <span class="status-badge badge-info">Admin Alert</span>
      <h2 class="title">New Client Registered</h2>
      <p class="subtitle">A new customer has created an account.</p>
      
      <div class="highlight-box">
        <table class="info-table">
           ${renderInfoRow('Name', name)}
           ${renderInfoRow('Email', email)}
           ${renderInfoRow('Phone', phone)}
        </table>
      </div>

      <div class="btn-container">
        <a href="${WEBSITE_URL}/admin/customers" class="btn-primary">View Customer List</a>
      </div>
    </div>`;

  return baseLayout(body);
}

// ============================================================
// 10. Welcome Email
// ============================================================

interface WelcomeData {
  name: string;
}

export function welcomeTemplate(data: WelcomeData): string {
  const { name } = data;

  const body = `
    <div class="content">
      <span class="status-badge badge-success">Welcome</span>
      <h2 class="title">Welcome to Habiba Minhas, ${name}!</h2>
      <p class="subtitle">We're delighted to have you join our community of fashion enthusiasts.</p>
      
      <p class="text">At Habiba Minhas, we believe in the art of handcrafted fashion. Every piece in our collection is designed with a focus on premium quality, elegance, and timeless style.</p>

      <div class="btn-container">
        <a href="${WEBSITE_URL}/shop" class="btn-primary">Explore Collections</a>
      </div>

      <p class="note">Follow us on WhatsApp for exclusive early access to our 2026 drops.</p>
      
      <div style="text-align:center; margin-top: 10px;">
         <a href="${WHATSAPP_LINK}" style="color: #25D366; font-weight: 700; text-decoration: none; font-size: 13px; letter-spacing: 1px;">JOIN WHATSAPP CHANNEL</a>
      </div>
    </div>`;

  return baseLayout(body);
}
