'use client'

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ProductService } from "@/services/product.service";

export default function NewArrivals() {
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNewArrivals() {
      try {
        const data = await ProductService.getProducts();
        // Assuming order by 'created_at' desc from service, just take top 8
        // Or if we need strict "is_new" flag if available in DB props? 
        // Let's rely on creation date or sort order from service which is created_at desc
        const freshDrops = data.slice(0, 8); 
        setNewProducts(freshDrops);
      } catch (error) {
        console.error("Failed to load new arrivals:", error);
      } finally {
        setLoading(false);
      }
    }
    loadNewArrivals();
  }, []);

  if (loading) {
     return <div className="py-20 text-center">Loading New Arrivals...</div>;
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="text-primary font-body text-xs tracking-[0.3em] uppercase">Just Dropped</p>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-light">New Arrivals</h2>
          <p className="text-muted-foreground font-body text-sm mt-3 max-w-md mx-auto">
            Be the first to explore our latest additions, handpicked for style and quality.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {newProducts.map((product, i) => (
            <ProductCard 
                key={product.id} 
                product={{
                  ...product,
                  price: product.sale_price || product.price,
                  originalPrice: product.sale_price ? product.price : null,
                  image: product.images?.[0] || '/assets/placeholder.jpg',
                  category: product.category?.name || 'Uncategorized',
                  isNew: true // These ARE the new arrivals
                }} 
                index={i} 
              />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/shop"
            className="inline-block bg-primary text-primary-foreground px-10 py-3.5 text-sm font-body font-medium tracking-widest uppercase hover:bg-gold-dark transition-colors duration-300"
          >
            View All New Arrivals
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
