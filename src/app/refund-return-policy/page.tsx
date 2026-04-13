import React from 'react';
import Link from 'next/link';

export const metadata = {
    title: 'Refund & Return Policy',
    description: 'Our policies regarding refunds and returns for products purchased at Habiba Minhas.',
    alternates: {
        canonical: '/refund-return-policy/',
    },
};

export default function RefundPolicyPage() {
    return (
        <div className="bg-white min-h-screen text-gray-900 font-body py-12 md:py-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl md:text-5xl font-heading font-bold mb-6 text-center">Refund & Return Policy</h1>
                <p className="text-center text-gray-500 mb-12">We want you to love what you ordered.</p>

                <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-primary prose-a:text-primary">
                    <h2>1. Return Eligibility</h2>
                    <p>
                        You have 14 calendar days to return an item from the date you received it. To be eligible for a return:
                    </p>
                    <ul>
                        <li>Your item must be unused and in the same condition that you received it.</li>
                        <li>Your item must be in the original packaging.</li>
                        <li>Your item must have the receipt or proof of purchase.</li>
                        <li>Clearance items are final sale and cannot be returned.</li>
                    </ul>

                    <h2>2. Refunds</h2>
                    <p>
                        Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.
                    </p>
                    <p>
                        If your return is approved, we will initiate a refund to your original method of payment (or via bank transfer for COD orders). You will receive the credit within a certain amount of days, depending on your card issuer's policies.
                    </p>

                    <h2>3. Exchanges</h2>
                    <p>
                        If you need to exchange an item for a different size or color, please return your original item for a refund and place a new order. This ensures you get the new item quickly and avoids inventory issues.
                    </p>

                    <h2>4. Shipping Costs</h2>
                    <p>
                        You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund if we provide a return label.
                    </p>

                    <h2>5. Damaged Items</h2>
                    <p>
                        If you received a damaged product, please notify us immediately for assistance. Contact us at <a href="mailto:support@habibaminhas.com">support@habibaminhas.com</a> with a photo of the damage.
                    </p>

                    <h2>6. Contact Us</h2>
                    <p>
                        If you have any questions on how to return your item to us, contact us at:
                    </p>
                    <p>
                        <strong>Email:</strong> support@habibaminhas.com <br />
                        <strong>WhatsApp:</strong> +92 334 8438007
                    </p>

                    <div className="mt-8 not-prose text-center">
                        <Link href="/contact" className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
