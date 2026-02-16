import HeroSection from "@/components/HeroSection";
import TrustBadges from "@/components/TrustBadges";
import CategoryHighlights from "@/components/CategoryHighlights";
import FeaturedProducts from "@/components/FeaturedProducts";
import NewArrivals from "@/components/NewArrivals";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import { getProducts } from "@/lib/server-queries";

// Force dynamic rendering — never cache this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

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
      <Newsletter />
    </main>
  );
}
