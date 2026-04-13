import React from 'react';

export const metadata = {
    title: 'Shipping Policy',
    description: 'Information about our shipping methods, delivery times, and costs.',
    alternates: {
        canonical: '/shipping-policy/',
    },
};

export default function ShippingPolicyPage() {
    return (
        <div className="bg-white min-h-screen text-gray-900 font-body py-12 md:py-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl md:text-5xl font-heading font-bold mb-6 text-center">Shipping Policy</h1>
                <p className="text-center text-gray-500 mb-12">Fast, reliable delivery to your doorstep.</p>

                <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-primary prose-a:text-primary">
                    <h2>1. Processing Time</h2>
                    <p>
                        All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery.
                    </p>

                    <h2>2. Shipping Rates & Delivery Estimates</h2>
                    <p>
                        Shipping charges for your order will be calculated and displayed at checkout.
                    </p>
                    <ul>
                        <li><strong>Standard Shipping:</strong> 3-5 business days - PKR 250 (Free for orders over PKR 5000)</li>
                        <li><strong>Express Shipping:</strong> 1-2 business days - PKR 500</li>
                    </ul>
                    <p>
                        Delivery delays can occasionally occur due to unforeseen circumstances or courier delays.
                    </p>

                    <h2>3. Shipment Confirmation & Order Tracking</h2>
                    <p>
                        You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.
                    </p>

                    <h2>4. Customs, Duties and Taxes</h2>
                    <p>
                        Habiba Minhas is not responsible for any customs and taxes applied to your order. All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes, etc.).
                    </p>

                    <h2>5. Damages</h2>
                    <p>
                        Habiba Minhas is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.
                    </p>

                    <h2>6. International Shipping</h2>
                    <p>
                        We currently do not ship outside of Pakistan.
                    </p>

                </div>
            </div>
        </div>
    );
}
