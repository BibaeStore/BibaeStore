import { CouponCode } from './CouponsClient';

export const metadata = {
    title: 'Promo Codes & Coupons',
    description: 'Find the latest valid discount codes and coupons for Habiba Minhas.',
};

export default function CouponsPage() {
    return (
        <div className="bg-white min-h-screen text-gray-900 font-body py-12 md:py-20">
            <div className="container mx-auto px-4 max-w-4xl text-center">
                <h1 className="text-3xl md:text-5xl font-heading font-bold mb-6">Current Offers & Coupons</h1>
                <p className="text-xl text-gray-600 mb-12">
                    Save on your favorite styles with our official discount codes.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Offer 1 */}
                    <div className="border-2 border-dashed border-primary/30 bg-primary/5 rounded-xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase">
                            New Customer
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">10% OFF</h3>
                        <p className="text-gray-600 mb-6">Get 10% off your first order when you sign up for our newsletter.</p>
                        <CouponCode code="WELCOME10" />
                        <p className="text-xs text-gray-400 mt-4">Valid for first-time customers only.</p>
                    </div>

                    {/* Offer 2 */}
                    <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl p-8 relative">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Shipping</h3>
                        <p className="text-gray-600 mb-6">Enjoy free standard shipping on all orders over PKR 5000.</p>
                        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                            <span className="font-medium text-gray-500">Auto-applied at checkout</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-4">No code required.</p>
                    </div>
                </div>

                <div className="mt-16 bg-gray-900 text-white rounded-2xl p-8 md:p-12">
                    <h2 className="text-2xl font-heading font-bold mb-4">Want more exclusive offers?</h2>
                    <p className="mb-8 opacity-80">Join our VIP list and get secret deals sent straight to your inbox.</p>
                    <form className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-4 py-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button type="submit" className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-lg transition-colors">
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
