'use client'

import HeroSection from "@/components/HeroSection";
import TrustBadges from "@/components/TrustBadges";
import CategoryHighlights from "@/components/CategoryHighlights";
import FeaturedProducts from "@/components/FeaturedProducts";
import NewArrivals from "@/components/NewArrivals";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";

const Index = () => {
  return (
    <main>
      <HeroSection />
      <TrustBadges />
      <CategoryHighlights />
      <FeaturedProducts />
      <NewArrivals />
      <Testimonials />
      <Newsletter />
    </main>
  );
};

export default Index;
