import { z } from "zod";

// Contact information schema
export const contactSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number"),
});

// Shipping address schema
export const shippingSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    address: z.string().min(5, "Please enter your full address"),
    city: z.string().min(2, "Please enter your city"),
    state: z.string().min(2, "Please enter your state/province"),
    zipCode: z.string().min(4, "Please enter a valid postal code"),
    country: z.string().min(2, "Please select your country"),
});

// Payment schema (UI only, no real processing)
export const paymentSchema = z.object({
    cardNumber: z.string().min(13, "Card number must be at least 13 digits").max(19, "Card number is too long"),
    cardName: z.string().min(3, "Please enter the name on card"),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Please enter expiry date as MM/YY"),
    cvv: z.string().min(3, "CVV must be 3 or 4 digits").max(4, "CVV must be 3 or 4 digits"),
});

// Complete checkout schema
export const checkoutSchema = contactSchema.merge(shippingSchema).merge(paymentSchema);

export type ContactFormData = z.infer<typeof contactSchema>;
export type ShippingFormData = z.infer<typeof shippingSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
