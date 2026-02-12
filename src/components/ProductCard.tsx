'use client'

import Link from "next/link";
import { Heart, Eye } from "lucide-react";
import { Product, formatPrice } from "@/lib/products";
import { motion } from "framer-motion";

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Link href={`/product/${product.id}`} className="group block h-full">
        <div className="relative overflow-hidden bg-white aspect-[3/4] shadow-card group-hover:shadow-card-hover border border-gray-200 group-hover:border-primary/50 transition-all duration-500 rounded-sm">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNew && (
              <span className="bg-foreground text-background text-[10px] font-body font-semibold tracking-wider uppercase px-3 py-1">
                New
              </span>
            )}
            {discount > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-body font-semibold tracking-wider px-3 py-1">
                -{discount}%
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <button
              onClick={(e) => { e.preventDefault(); }}
              className="p-2.5 bg-background/90 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
              aria-label="Add to wishlist"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); }}
              className="p-2.5 bg-background/90 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
              aria-label="Quick view"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-foreground/90 backdrop-blur-sm text-background text-center py-3 text-xs font-body font-medium tracking-widest uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            View Details
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <p className="text-[11px] font-body text-muted-foreground tracking-[0.15em] uppercase">{product.category}</p>
          <h3 className="font-heading text-lg font-medium leading-tight group-hover:text-primary transition-colors duration-300">{product.name}</h3>
          <div className="flex items-center gap-2.5">
            <span className="font-body font-semibold text-sm">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="font-body text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
