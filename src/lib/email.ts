// ============================================================
// Bibae Store - Email Sending Service (Nodemailer Edition)
// ============================================================

import nodemailer from 'nodemailer';
import {
  orderPlacedTemplate,
  orderConfirmedTemplate,
  orderDispatchedTemplate,
  orderDeliveredTemplate,
  paymentRejectedTemplate,
  cancellationApprovedTemplate,
  cancellationRequestAdminTemplate,
  newOrderAdminTemplate,
  newUserAdminTemplate,
  welcomeTemplate,
} from './email-templates';

// --------------------------------------------------
// SMTP Configuration
// --------------------------------------------------

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com', // Defaulting to Gmail but should be set in .env
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // Use SSL/TLS
  auth: {
    user: process.env.SMTP_USER, // e.g., no-reply@bibaestore.com
    pass: process.env.SMTP_PASSWORD,
  },
});

const FROM_ADDRESS = '"Bibaé Store" <no-reply@bibaestore.com>';
const SUPPORT_ADDRESS = '"Bibaé Support" <support@bibaestore.com>';
const ADMIN_EMAIL = 'bibaestore@gmail.com';

// --------------------------------------------------
// Types
// --------------------------------------------------

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderPlacedData {
  name: string;
  trackingNumber: string;
  totalAmount: number;
  paymentMethod: string;
  items: OrderItem[];
}

interface OrderConfirmedData {
  name: string;
  trackingNumber: string;
}

interface OrderDispatchedData {
  name: string;
  trackingNumber: string;
  dispatchNote?: string;
}

interface OrderDeliveredData {
  name: string;
  trackingNumber: string;
}

interface PaymentRejectedData {
  name: string;
  trackingNumber: string;
}

interface CancellationApprovedData {
  name: string;
  trackingNumber: string;
}

interface CancellationRequestAdminData {
  customerName: string;
  trackingNumber: string;
  reason: string;
}

// --------------------------------------------------
// Helper: Send Mail
// --------------------------------------------------

async function sendMail({ to, subject, html, replyTo }: { to: string; subject: string; html: string; replyTo?: string }) {
  try {
    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
      replyTo: replyTo || SUPPORT_ADDRESS,
    });
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}

// --------------------------------------------------
// Send functions
// --------------------------------------------------

/**
 * When customer places an order:
 * 1. Send confirmation to Customer
 * 2. Send notification to Admin
 */
export async function sendOrderPlacedEmail(to: string, data: OrderPlacedData) {
  // 1. To Customer
  const customerMail = await sendMail({
    to,
    subject: `Order Confirmation — ${data.trackingNumber} | Bibaé Store`,
    html: orderPlacedTemplate(data),
  });

  // 2. To Admin
  await sendMail({
    to: ADMIN_EMAIL,
    subject: `🔔 NEW ORDER: ${data.trackingNumber} — ${data.name}`,
    html: newOrderAdminTemplate({ ...data, customerEmail: to }),
  });

  return customerMail;
}

export async function sendOrderConfirmedEmail(to: string, data: OrderConfirmedData) {
  return await sendMail({
    to,
    subject: `Order Confirmed — ${data.trackingNumber} | Bibaé Store`,
    html: orderConfirmedTemplate(data),
  });
}

export async function sendOrderDispatchedEmail(to: string, data: OrderDispatchedData) {
  return await sendMail({
    to,
    subject: `Your Order is On Its Way — ${data.trackingNumber} | Bibaé Store`,
    html: orderDispatchedTemplate(data),
  });
}

export async function sendOrderDeliveredEmail(to: string, data: OrderDeliveredData) {
  return await sendMail({
    to,
    subject: `Order Delivered — ${data.trackingNumber} | Bibaé Store`,
    html: orderDeliveredTemplate(data),
  });
}

export async function sendPaymentRejectedEmail(to: string, data: PaymentRejectedData) {
  return await sendMail({
    to,
    subject: `Payment Issue — ${data.trackingNumber} | Bibaé Store`,
    html: paymentRejectedTemplate(data),
  });
}

export async function sendCancellationApprovedEmail(to: string, data: CancellationApprovedData) {
  return await sendMail({
    to,
    subject: `Cancellation Approved — ${data.trackingNumber} | Bibaé Store`,
    html: cancellationApprovedTemplate(data),
  });
}

export async function sendCancellationRequestToAdmin(data: CancellationRequestAdminData) {
  return await sendMail({
    to: ADMIN_EMAIL,
    subject: `Cancellation Request — ${data.trackingNumber} | ${data.customerName}`,
    html: cancellationRequestAdminTemplate(data),
  });
}

/**
 * Helper for welcome emails (previously in resend.ts)
 */
export async function sendWelcomeEmail(to: string, name: string) {
  return await sendMail({
    to,
    subject: `Welcome to Bibaé Store, ${name}!`,
    html: welcomeTemplate({ name }),
  });
}

/**
 * Helper for admin registration notifications (previously in resend.ts)
 */
export async function sendAdminNewUserEmail(data: { email: string; name: string; phone: string }) {
  return await sendMail({
    to: ADMIN_EMAIL,
    subject: `✨ New Client Registered: ${data.name}`,
    html: newUserAdminTemplate(data),
  });
}
