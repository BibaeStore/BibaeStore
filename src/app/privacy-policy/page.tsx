import React from 'react';

export const metadata = {
    title: 'Privacy Policy',
    description: 'Our commitment to protecting your privacy and personal data.',
    alternates: {
        canonical: '/privacy-policy',
    },
};

export default function PrivacyPolicyPage() {
    return (
        <div className="bg-white min-h-screen text-gray-900 font-body py-12 md:py-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl md:text-5xl font-heading font-bold mb-6 text-center">Privacy Policy</h1>
                <p className="text-center text-gray-500 mb-12">Last Updated: February 2026</p>

                <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-primary prose-a:text-primary">
                    <p>
                        At Habiba Minhas, accessible from habibaminhas.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Habiba Minhas and how we use it.
                    </p>

                    <h3>1. Information We Collect</h3>
                    <p>
                        We collect information you provide directly to us on our website, such as when you create an account, place an order, subscribe to our newsletter, or contact us. This may include your name, email address, postal address, phone number, and payment information.
                    </p>

                    <h3>2. How We Use Your Information</h3>
                    <p>We use the information we collect in various ways, including to:</p>
                    <ul>
                        <li>Provide, operate, and maintain our website</li>
                        <li>Improve, personalize, and expand our website</li>
                        <li>Understand and analyze how you use our website</li>
                        <li>Develop new products, services, features, and functionality</li>
                        <li>Process your transactions and manage your orders</li>
                        <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
                        <li>Find and prevent fraud</li>
                    </ul>

                    <h3>3. Cookies and Web Beacons</h3>
                    <p>
                        Like any other website, Habiba Minhas uses 'cookies'. These cookies are used to store information including visitors &apos; preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users &apos; experience by customizing our web page content based on visitors &apos; browser type and/or other information.
                    </p>

                    <h3>4. Third Party Privacy Policies</h3>
                    <p>
                        Habiba Minhas&apos;s Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
                    </p>

                    <h3>5. Data Security</h3>
                    <p>
                        We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. However, please be aware that no method of transmission over the Internet, or method of electronic storage is 100% secure and we cannot guarantee its absolute security.
                    </p>

                    <h3>6. Contact Us</h3>
                    <p>
                        If you have any questions about our Privacy Policy, please contact us via email at <strong>support@habibaminhas.com</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
}
