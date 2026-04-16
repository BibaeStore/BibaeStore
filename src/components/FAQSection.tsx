import React from 'react';
import FAQAccordion from './FAQAccordion';

const faqItems = [
    {
        question: "How long does shipping take?",
        answer: (
            <p>
                All orders are processed within 1-2 business days. Standard shipping takes <strong>3-5 business days</strong> across Pakistan. We also offer <strong>Express Shipping (1-2 business days)</strong> for faster delivery.
            </p>
        ),
        plainAnswer: "All orders are processed within 1-2 business days. Standard shipping takes 3-5 business days across Pakistan. We also offer Express Shipping (1-2 business days) for faster delivery."
    },
    {
        question: "Do you offer free shipping?",
        answer: (
            <p>
                Yes! We offer <strong>free Standard Shipping</strong> on all orders over PKR 5,000 within Pakistan. For orders under PKR 5,000, standard shipping is PKR 250.
            </p>
        ),
        plainAnswer: "Yes! We offer free Standard Shipping on all orders over PKR 5,000 within Pakistan. For orders under PKR 5,000, standard shipping is PKR 250."
    },
    {
        question: "What is your return and refund policy?",
        answer: (
            <p>
                We offer a <strong>14-day return policy</strong> for items in their original, unused condition with packaging and receipt. Once we receive and inspect your item, we will initiate a full refund. Please note, clearance items are final sale and shipping costs are non-refundable.
            </p>
        ),
        plainAnswer: "We offer a 14-day return policy for items in their original, unused condition with packaging and receipt. Once we receive and inspect your item, we will initiate a full refund. Please note, clearance items are final sale and shipping costs are non-refundable."
    },
    {
        question: "How do exchanges work?",
        answer: (
            <p>
                If you need a different size or color, please return your original item for a refund and place a new order. This ensures you get your new item quickly before it sells out!
            </p>
        ),
        plainAnswer: "If you need a different size or color, please return your original item for a refund and place a new order. This ensures you get your new item quickly before it sells out!"
    },
    {
        question: "Do you ship internationally?",
        answer: (
            <p>
                Currently, we only ship within Pakistan. However, we are working on expanding our delivery network soon!
            </p>
        ),
        plainAnswer: "Currently, we only ship within Pakistan. However, we are working on expanding our delivery network soon!"
    }
];

export default function FAQSection() {
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.plainAnswer
            }
        }))
    };

    return (
        <section className="bg-gray-50 py-16 md:py-24 border-t border-gray-100">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-heading font-medium text-gray-900 mb-4">Frequently Asked Questions</h2>
                    <p className="text-gray-600 font-body max-w-2xl mx-auto">
                        Got a question? We're here to help. If you don't see your question here, feel free to reach out to our support team.
                    </p>
                </div>

                <FAQAccordion items={faqItems} />
            </div>
        </section>
    );
}
