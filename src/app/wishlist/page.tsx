'use client';

import { useWishlist } from "@/lib/wishlist";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function WishlistPage() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-gray-50 p-6 rounded-full mb-6">
          <Heart className="w-12 h-12 text-gray-300" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">Your wishlist is empty</h1>
        <h2 className="text-lg font-body text-gray-500 mb-8 max-w-md mx-auto">
          Looks like you haven't added any items to your wishlist yet. Browse our collection and save your favorites!
        </h2>
        <Link 
          href="/shop" 
          className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors uppercase tracking-wider text-sm"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-2">My Wishlist</h1>
          <h2 className="text-lg text-gray-500 font-body">Manage your {items.length} {items.length === 1 ? 'saved item' : 'saved items'} below</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-12">
        {items.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
