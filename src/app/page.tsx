import HeroSection from "@/components/HeroSection";
import TrustBadges from "@/components/TrustBadges";
import CategoryHighlights from "@/components/CategoryHighlights";
import FeaturedProducts from "@/components/FeaturedProducts";
import NewArrivals from "@/components/NewArrivals";
import Testimonials from "@/components/Testimonials";
import TrackOrderBanner from "@/components/TrackOrderBanner";
import Newsletter from "@/components/Newsletter";
import FAQSection from "@/components/FAQSection";
import { getProducts } from "@/lib/server-queries";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Elegant Ethnic Wear & Handcrafted Accessories | Habiba Minhas",
  description: "Discover unique ethnic wear and artisanal accessories at Habiba Minhas. From statement jewelry to stylish apparel, find curated fashion that celebrates your style. Shop online today.",
  alternates: {
    canonical: "/",
  },
};

// Revalidate home page every 5 minutes (ISR)
export const revalidate = 300

export default async function Index() {
  const products = await getProducts();

  const featuredProducts = products.filter((p) => p.is_featured).slice(0, 8);
  const newArrivals = products.slice(0, 8);

  return (
    <main>
      <HeroSection />
      <TrustBadges />
      <CategoryHighlights />
      <FeaturedProducts products={featuredProducts} />
      <NewArrivals products={newArrivals} />
      <Testimonials />
      <TrackOrderBanner />

      {/* SEO Section: Authority & Expertise (Video Point: Establishing Trust) */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-light text-gray-900 mb-8">Elevating Boutique Fashion in Pakistan</h2>
            <div className="prose prose-slate mx-auto font-body text-gray-600 leading-relaxed">
              <p className="mb-6">
                Welcome to <strong>Habiba Minhas</strong>, your premier destination for handcrafted boutique wear that blends traditional Pakistani artistry with modern 2026 fashion trends. Our mission is to provide premium quality fabrics and exclusive designs that celebrate Every woman's unique style.
              </p>
              <p className="mb-6">
                From luxury formal collections to elegant daily wear, every piece at Habiba Minhas is a testament to the skill of our local artisans. We pride ourselves on using 100% authentic materials and ensuring meticulous attention to detail in every stitch.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-gray-50 mt-12">
                <div>
                  <h4 className="font-heading font-bold text-gray-900 text-lg mb-2">100+</h4>
                  <p className="text-xs uppercase tracking-widest text-primary">Unique Designs</p>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-gray-900 text-lg mb-2">Fast</h4>
                  <p className="text-xs uppercase tracking-widest text-primary">Nationwide Shipping</p>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-gray-900 text-lg mb-2">Premium</h4>
                  <p className="text-xs uppercase tracking-widest text-primary">Quality Control</p>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-gray-900 text-lg mb-2">Trusted</h4>
                  <p className="text-xs uppercase tracking-widest text-primary">By Thousands</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FAQSection />
      <Newsletter />
    </main>
  );
}
