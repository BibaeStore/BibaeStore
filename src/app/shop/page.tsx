import { Suspense } from "react";
import { getProducts } from "@/lib/server-queries";
import ShopContent from "./ShopContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Online - Premium Boutique Wear 2026",
  description: "Browse our 2026 collection of premium boutique wear. From elegant formals to chic casuals, find your perfect style at Habiba Minhas. Fast delivery in Pakistan.",
  keywords: ['online boutique shopping pakistan', 'ready to wear dresses', 'stitched lawn suits', 'kids boutique wear', 'habiba minhas collections'],
  alternates: {
    canonical: "https://habibaminhas.com/shop/",
  },
};

// Force dynamic rendering — never cache this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Shop() {
  const products = await getProducts();

  return (
    <main>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Store...</div>}>
        <ShopContent initialProducts={products} />
      </Suspense>
    </main>
  );
}
