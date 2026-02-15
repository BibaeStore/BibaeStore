'use client'

import Link from "next/link";
import { Heart } from "lucide-react";
import { formatPrice } from "@/lib/products";
import { motion } from "framer-motion";
import { useWishlist } from "@/lib/wishlist";

export interface ProductCardItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  category: string;
  isNew?: boolean;
  [key: string]: any;
}

interface Props {
  product: ProductCardItem;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isSoldOut = product.stock !== undefined && product.stock <= 0;

  const { toggleWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const Wrapper = isSoldOut ? 'div' : Link;
  const wrapperProps = isSoldOut
    ? { className: "block h-full cursor-default" }
    : { href: `/product/${product.id}`, className: "group block h-full" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* @ts-expect-error - dynamic wrapper */}
      <Wrapper {...wrapperProps}>
        <div className={`relative overflow-hidden bg-white aspect-[3/4] shadow-card border border-gray-200 transition-all duration-500 rounded-sm ${isSoldOut ? 'grayscale-[30%]' : 'group-hover:shadow-card-hover group-hover:border-primary/50'}`}>
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-700 ${isSoldOut ? '' : 'group-hover:scale-105'}`}
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNew && !isSoldOut && (
              <span className="bg-foreground text-background text-[10px] font-body font-semibold tracking-wider uppercase px-3 py-1">
                New
              </span>
            )}
            {discount > 0 && !isSoldOut && (
              <span className="bg-primary text-primary-foreground text-[10px] font-body font-semibold tracking-wider px-3 py-1">
                -{discount}%
              </span>
            )}
          </div>

          {/* Sold Out Overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
              <span className="bg-white text-gray-900 text-xs sm:text-sm font-heading font-bold tracking-[0.2em] uppercase px-5 py-2 shadow-lg">
                Sold Out
              </span>
            </div>
          )}

          {/* Actions (hidden when sold out) */}
          {!isSoldOut && (
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist(product);
                }}
                className={`p-2.5 backdrop-blur-sm transition-colors duration-200 ${
                  isWishlisted
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-background/90 hover:bg-primary hover:text-primary-foreground'
                }`}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          )}

          {/* Bottom overlay (hidden when sold out) */}
          {!isSoldOut && (
            <div className="absolute inset-x-0 bottom-0 bg-foreground/90 backdrop-blur-sm text-background text-center py-3 text-xs font-body font-medium tracking-widest uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              View Details
            </div>
          )}
        </div>

        <div className={`mt-4 space-y-1.5 ${isSoldOut ? 'opacity-50' : ''}`}>
          <p className="text-[11px] font-body text-muted-foreground tracking-[0.15em] uppercase">{product.category}</p>
          <h3 className={`font-heading text-lg font-medium leading-tight transition-colors duration-300 ${isSoldOut ? '' : 'group-hover:text-primary'}`}>{product.name}</h3>
          <div className="flex items-center gap-2.5">
            <span className="font-body font-semibold text-sm">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="font-body text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Wrapper>
    </motion.div>
  );
}
