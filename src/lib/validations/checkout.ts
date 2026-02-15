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

// Payment schema
export const paymentSchema = z.object({
    method: z.enum(["cod", "online"], {
        required_error: "Please select a payment method",
    }),
    onlineMethod: z.enum(["sadapay", "jazzcash", "easypaisa", "askari"]).optional(),
    proofFile: z.any().optional(),
}).refine((data) => {
    if (data.method === "online") {
        return !!data.onlineMethod;
    }
    return true;
}, {
    message: "Please select a payment account",
    path: ["onlineMethod"],
}).refine((data) => {
    if (data.method === "online") {
        return !!data.proofFile;
    }
    return true;
}, {
    message: "Please upload your payment proof screenshot",
    path: ["proofFile"],
});

// Complete checkout schema
export const checkoutSchema = z.intersection(contactSchema.merge(shippingSchema), paymentSchema);

export type ContactFormData = z.infer<typeof contactSchema>;
export type ShippingFormData = z.infer<typeof shippingSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
