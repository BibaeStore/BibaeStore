'use client'

import ProductCard from "./ProductCard";
import { motion } from "framer-motion";
import Link from "next/link";
import { Award } from "lucide-react";
import { Product } from "@/types/product";

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="bg-muted/50 py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-primary" />
            <p className="text-primary font-body text-xs tracking-[0.3em] uppercase">Curated for You</p>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-light">Best Sellers</h2>
          <p className="text-muted-foreground font-body text-sm mt-3 max-w-md mx-auto">
            Our most loved pieces, chosen by thousands of happy customers.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                price: product.sale_price || product.price,
                originalPrice: product.sale_price ? product.price : null,
                image: product.images?.[0] || '/assets/placeholder.jpg',
                category: product.category?.name || 'Uncategorized',
                isNew: product.created_at ? (new Date().getTime() - new Date(product.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000 : false
              }}
              index={i}
              priority={i < 2}
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
            href="/shop/"
            className="inline-block border border-gray-900 bg-white text-gray-900 px-10 py-3.5 text-sm font-body font-medium tracking-widest uppercase hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-button hover:shadow-button-hover hover:-translate-y-0.5"
          >
            View All Products
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
