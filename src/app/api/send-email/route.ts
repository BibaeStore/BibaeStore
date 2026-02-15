import { NextResponse } from 'next/server';
import {
  sendOrderPlacedEmail,
  sendOrderConfirmedEmail,
  sendOrderDispatchedEmail,
  sendOrderDeliveredEmail,
  sendPaymentRejectedEmail,
  sendCancellationApprovedEmail,
  sendCancellationRequestToAdmin,
} from '@/lib/email';

// Valid email types accepted by the API
type EmailType =
  | 'order_placed'
  | 'order_confirmed'
  | 'order_dispatched'
  | 'order_delivered'
  | 'payment_rejected'
  | 'cancellation_approved'
  | 'cancellation_request_admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, to, data } = body as {
      type: EmailType;
      to?: string;
      data: Record<string, unknown>;
    };

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type and data are required' },
        { status: 400 }
      );
    }

    // The admin notification does not need a "to" field
    if (type !== 'cancellation_request_admin' && !to) {
      return NextResponse.json(
        { error: 'Missing required field: to (recipient email address)' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'order_placed':
        result = await sendOrderPlacedEmail(to!, data as any);
        break;

      case 'order_confirmed':
        result = await sendOrderConfirmedEmail(to!, data as any);
        break;

      case 'order_dispatched':
        result = await sendOrderDispatchedEmail(to!, data as any);
        break;

      case 'order_delivered':
        result = await sendOrderDeliveredEmail(to!, data as any);
        break;

      case 'payment_rejected':
        result = await sendPaymentRejectedEmail(to!, data as any);
        break;

      case 'cancellation_approved':
        result = await sendCancellationApprovedEmail(to!, data as any);
        break;

      case 'cancellation_request_admin':
        result = await sendCancellationRequestToAdmin(data as any);
        break;

      default:
        return NextResponse.json(
          {
            error: `Invalid email type: ${type}. Valid types: order_placed, order_confirmed, order_dispatched, order_delivered, payment_rejected, cancellation_approved, cancellation_request_admin`,
          },
          { status: 400 }
        );
    }

    return NextResponse.json(
      { message: 'Email sent successfully', data: result },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send Email API Error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
