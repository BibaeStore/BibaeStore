'use client'

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/products";
import { motion } from "framer-motion";
import Image from "next/image";
import { useWishlist } from "@/lib/wishlist";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface ProductCardItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  category: string;
  isNew?: boolean;
  slug?: string;
  variants?: {
    sizes?: Record<string, any>;
    colors?: string[];
  };
  sizes?: string[];
  colors?: string[];
  [key: string]: any;
}

interface Props {
  product: ProductCardItem;
  index?: number;
  priority?: boolean;
}

export default function ProductCard({ product, index = 0, priority = false }: Props) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const isWishlisted = isInWishlist(product.id);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isSoldOut = product.stock !== undefined && product.stock <= 0;
  const href = product.slug ? `/shop/${product.slug}` : `/shop/${product.id}`;

  const hasVariants =
    (product.variants?.sizes && Object.keys(product.variants.sizes).length > 1) ||
    (product.sizes && product.sizes.length > 1) ||
    (product.variants?.colors && product.variants.colors.length > 1) ||
    (product.colors && product.colors.length > 1);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToCart) return;
    setIsAddingToCart(true);

    // Default values for simple products
    const size = product.sizes?.[0] || (product.variants?.sizes ? Object.keys(product.variants.sizes)[0] : "Standard");
    const color = product.colors?.[0] || product.variants?.colors?.[0] || "Default";

    try {
      const success = await addItem({
        ...product,
        image: product.image,
        price: product.price,
      }, size || "Standard", color || "Default", 1);

      if (success) {
        toast.success("Added to cart");
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`h-full ${isSoldOut ? 'cursor-default' : 'group relative'}`}
    >
      <div className="flex flex-col h-full">
        {/* Image Container */}
        <div className={`relative overflow-hidden bg-white aspect-[3/4] shadow-card border border-gray-200 transition-all duration-500 rounded-sm ${isSoldOut ? 'grayscale-[30%]' : 'group-hover:shadow-card-hover group-hover:border-primary/50'}`}>
          {/* Link covering the image (if not sold out) */}
          {!isSoldOut && (
            <Link href={href} className="absolute inset-0 z-10" aria-label={`View ${product.name}`}>
              <span className="sr-only">View {product.name}</span>
            </Link>
          )}

          <Image
            src={product.image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={`object-cover transition-transform duration-700 relative z-0 ${isSoldOut ? '' : 'group-hover:scale-105'}`}
            loading={priority ? "eager" : "lazy"}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20 pointer-events-none">
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
            <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center">
              <span className="bg-white text-gray-900 text-xs sm:text-sm font-heading font-bold tracking-[0.2em] uppercase px-5 py-2 shadow-lg">
                Sold Out
              </span>
            </div>
          )}

          {/* Actions (hidden when sold out) - z-30 to be above Link */}
          {!isSoldOut && (
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-30">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWishlist(product);
                }}
                className={`p-2.5 backdrop-blur-sm transition-colors duration-200 shadow-sm rounded-full ${isWishlisted
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-white/90 hover:bg-primary hover:text-primary-foreground text-gray-700'
                  }`}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>

              {hasVariants ? (
                <Link
                  href={href}
                  className="p-2.5 backdrop-blur-sm bg-white/90 hover:bg-primary hover:text-primary-foreground text-gray-700 transition-colors duration-200 shadow-sm rounded-full flex items-center justify-center"
                  aria-label="Select options"
                >
                  <ShoppingBag className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="p-2.5 backdrop-blur-sm bg-white/90 hover:bg-primary hover:text-primary-foreground text-gray-700 transition-colors duration-200 shadow-sm rounded-full flex items-center justify-center"
                  aria-label="Add to cart"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Bottom overlay (hidden when sold out) */}
          {!isSoldOut && (
            <div className="absolute inset-x-0 bottom-0 bg-foreground/90 backdrop-blur-sm text-background text-center py-3 text-xs font-body font-medium tracking-widest uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 pointer-events-none">
              View Details
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className={`mt-4 space-y-1.5 ${isSoldOut ? 'opacity-50' : ''}`}>
          <p className="text-[11px] font-body text-muted-foreground tracking-[0.15em] uppercase">
            {typeof product.category === 'object' && product.category !== null && 'name' in product.category
              ? (product.category as any).name
              : product.category}
          </p>

          {!isSoldOut ? (
            <Link href={href} className="block group/link">
              <h3 className="font-heading text-lg font-medium leading-tight transition-colors duration-300 group-hover:text-primary group-hover/link:text-primary">{product.name}</h3>
            </Link>
          ) : (
            <h3 className="font-heading text-lg font-medium leading-tight">{product.name}</h3>
          )}

          <div className="flex items-center gap-2.5">
            <span className="font-body font-semibold text-sm">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="font-body text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
