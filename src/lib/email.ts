// ============================================================
// Bibae Store - Email Sending Service
// ============================================================

import { resend } from './resend';
import {
  orderPlacedTemplate,
  orderConfirmedTemplate,
  orderDispatchedTemplate,
  orderDeliveredTemplate,
  paymentRejectedTemplate,
  cancellationApprovedTemplate,
  cancellationRequestAdminTemplate,
} from './email-templates';

const FROM_ADDRESS = 'Bibaé Store <noreply@bibaestore.com>5grgr47r5t';
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
// Send functions
// --------------------------------------------------

export async function sendOrderPlacedEmail(to: string, data: OrderPlacedData) {
  return await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Order Placed — ${data.trackingNumber} | Bibaé Store`,
    html: orderPlacedTemplate(data),
  });
}

export async function sendOrderConfirmedEmail(to: string, data: OrderConfirmedData) {
  return await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Order Confirmed — ${data.trackingNumber} | Bibaé Store`,
    html: orderConfirmedTemplate(data),
  });
}

export async function sendOrderDispatchedEmail(to: string, data: OrderDispatchedData) {
  return await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Your Order is On Its Way — ${data.trackingNumber} | Bibaé Store`,
    html: orderDispatchedTemplate(data),
  });
}

export async function sendOrderDeliveredEmail(to: string, data: OrderDeliveredData) {
  return await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Order Delivered — ${data.trackingNumber} | Bibaé Store`,
    html: orderDeliveredTemplate(data),
  });
}

export async function sendPaymentRejectedEmail(to: string, data: PaymentRejectedData) {
  return await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Payment Issue — ${data.trackingNumber} | Bibaé Store`,
    html: paymentRejectedTemplate(data),
  });
}

export async function sendCancellationApprovedEmail(to: string, data: CancellationApprovedData) {
  return await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Cancellation Approved — ${data.trackingNumber} | Bibaé Store`,
    html: cancellationApprovedTemplate(data),
  });
}

export async function sendCancellationRequestToAdmin(data: CancellationRequestAdminData) {
  return await resend.emails.send({
    from: FROM_ADDRESS,
    to: ADMIN_EMAIL,
    subject: `Cancellation Request — ${data.trackingNumber} | ${data.customerName}`,
    html: cancellationRequestAdminTemplate(data),
  });
}
