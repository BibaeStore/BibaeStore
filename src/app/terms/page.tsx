import React from 'react';

export const metadata = {
    title: 'Terms & Conditions',
    description: 'Terms and conditions for using Habiba Minhas.',
    alternates: {
        canonical: '/terms',
    },
};

export default function TermsPage() {
    return (
        <div className="bg-white min-h-screen text-gray-900 font-body py-12 md:py-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl md:text-5xl font-heading font-bold mb-6 text-center">Terms of Service</h1>
                <p className="text-center text-gray-500 mb-12">Last Updated: February 2026</p>

                <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-primary prose-a:text-primary">
                    <p>
                        Welcome to Habiba Minhas! These terms and conditions outline the rules and regulations for the use of Habiba Minhas&apos;s Website.
                    </p>
                    <p>
                        By accessing this website we assume you accept these terms and conditions. Do not continue to use Habiba Minhas if you do not agree to take all of the terms and conditions stated on this page.
                    </p>

                    <h3>1. License</h3>
                    <p>
                        Unless otherwise stated, Habiba Minhas and/or its licensors own the intellectual property rights for all material on Habiba Minhas. All intellectual property rights are reserved. You may access this from Habiba Minhas for your own personal use subjected to restrictions set in these terms and conditions.
                    </p>

                    <h3>2. User Accounts</h3>
                    <p>
                        If you create an account on the Website, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account to any other actions taken in connection with it. We may monitor and review new accounts before you may sign in and start using our Services.
                    </p>

                    <h3>3. Products and Services</h3>
                    <p>
                        Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy.
                    </p>
                    <p>
                        We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate.
                    </p>

                    <h3>4. Pricing</h3>
                    <p>
                        Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.
                    </p>

                    <h3>5. Limitation of Liability</h3>
                    <p>
                        In no event shall Habiba Minhas, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. Habiba Minhas, including its officers, directors, and employees shall not be held liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this Website.
                    </p>

                    <h3>6. Governing Law</h3>
                    <p>
                        These terms and conditions are governed by and construed in accordance with the laws of Pakistan and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                    </p>

                    <h3>7. Changes to Terms</h3>
                    <p>
                        We reserve the right, at our sole discretion, to update, change or replace any part of these Terms of Service by posting updates and changes to our website. It is your responsibility to check our website periodically for changes.
                    </p>
                </div>
            </div>
        </div>
    );
}
