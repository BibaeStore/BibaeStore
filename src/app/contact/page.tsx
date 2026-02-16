import React from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

export const metadata = {
    title: 'Contact Us | Bibae Store',
    description: 'Get in touch with Bibae Store. We are here to assist you with your orders, inquiries, and feedback.',
    alternates: {
        canonical: '/contact',
    },
};

export default function ContactPage() {
    return (
        <div className="bg-white text-gray-900 font-body min-h-screen">
            {/* Header */}
            <div className="bg-gray-50 py-16 text-center border-b border-gray-200">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-primary">Get in Touch</h1>
                    <p className="text-gray-600 max-w-xl mx-auto">
                        Have a question or just want to say hello? We&apos;d love to hear from you.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                    {/* Contact Info */}
                    <div className="space-y-10">
                        <div>
                            <h2 className="text-2xl font-heading font-semibold mb-6">Contact Information</h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Fill out the form and our team will get back to you within 24 hours.
                                For urgent inquiries, please call or WhatsApp us directly.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-full text-primary">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Phone & WhatsApp</h3>
                                    <p className="text-gray-600 mt-1">+92 334 8438007</p>
                                    <p className="text-xs text-gray-500 mt-1">Mon-Fri from 9am to 6pm</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-full text-primary">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Email</h3>
                                    <p className="text-gray-600 mt-1">support@bibaestore.com</p>
                                    <p className="text-xs text-gray-500 mt-1">For general inquiries</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-full text-primary">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Office</h3>
                                    <p className="text-gray-600 mt-1">Lahore, Pakistan</p>
                                </div>
                            </div>
                        </div>

                        {/* Map Placeholder or additional info */}
                        <div className="w-full h-64 bg-gray-100 rounded-2xl overflow-hidden relative">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d435521.4079486252!2d74.05419766952765!3d31.482635226294467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107d9%3A0xc20bef0655979d89!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1708123456789!5m2!1sen!2s"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
                        <h2 className="text-2xl font-heading font-semibold mb-6">Send us a Message</h2>
                        <form className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="John"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                <select
                                    id="subject"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                                >
                                    <option>General Inquiry</option>
                                    <option>Order Status</option>
                                    <option>Returns & Exchanges</option>
                                    <option>Wholesale</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary text-white font-semibold py-3.5 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg"
                            >
                                Send Message
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
