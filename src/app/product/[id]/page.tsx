'use client'

import Link from "next/link";
import { products, formatPrice } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useState } from "react";
import { Heart, ShoppingBag, Star, ChevronLeft, Truck, Shield, RotateCcw, Check, Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";

import { use } from "react";

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = products.find((p) => p.id === id);
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageZoom, setImageZoom] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-heading text-4xl mb-4">Product not found</p>
          <Link href="/shop" className="text-primary font-body text-sm hover:underline">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    // Add items based on quantity
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize, selectedColor || product.colors[0]);
    }
    setAddedToCart(true);
    toast.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart!`);
    setTimeout(() => {
      setAddedToCart(false);
      setQuantity(1);
    }, 2000);
  };

  return (
    <main className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-muted/50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <span>/</span>
            <Link href={`/shop?category=${product.category}`} className="hover:text-foreground transition-colors">{product.category}</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <motion.div
              className="aspect-[3/4] overflow-hidden bg-muted sticky top-28 cursor-zoom-in group"
              onMouseEnter={() => setImageZoom(true)}
              onMouseLeave={() => setImageZoom(false)}
            >
              <motion.img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500"
                animate={{ scale: imageZoom ? 1.1 : 1 }}
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="bg-foreground text-background text-[10px] font-body font-semibold tracking-wider uppercase px-3 py-1.5">New</span>
                )}
                {discount > 0 && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-body font-semibold tracking-wider px-3 py-1.5">-{discount}% Off</span>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex flex-col"
          >
            <p className="text-xs font-body text-primary tracking-[0.3em] uppercase mb-3">{product.category} • {product.subcategory}</p>
            <h1 className="font-heading text-3xl md:text-5xl font-light mb-4 leading-tight">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-border"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-body font-medium">{product.rating}</span>
              <span className="text-xs font-body text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="font-heading text-3xl">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-muted-foreground line-through font-body text-lg">{formatPrice(product.originalPrice)}</span>
                  <span className="bg-primary/10 text-primary px-2.5 py-1 text-xs font-body font-semibold">Save {formatPrice(product.originalPrice - product.price)}</span>
                </>
              )}
            </div>

            <div className="w-full h-[1px] bg-border mb-8" />

            <p className="text-sm font-body text-muted-foreground leading-relaxed mb-8">{product.description}</p>

            {/* Size */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-body font-medium tracking-wider uppercase">Size</p>
                <button className="text-xs font-body text-primary hover:underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[50px] px-4 py-2.5 text-sm font-body border transition-all duration-200 ${selectedSize === size ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="mb-8">
              <p className="text-sm font-body font-medium mb-3 tracking-wider uppercase">
                Color{selectedColor && <span className="font-normal text-muted-foreground ml-2">— {selectedColor}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2.5 text-sm font-body border transition-all duration-200 ${selectedColor === color ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <p className="text-sm font-body font-medium mb-3 tracking-wider uppercase">Quantity</p>
              <div className="flex items-center border border-border w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-muted transition-colors disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 text-sm font-body font-medium min-w-[60px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="p-3 hover:bg-muted transition-colors disabled:opacity-50"
                  disabled={quantity >= 10}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {quantity >= 10 && (
                <p className="text-xs text-muted-foreground mt-2">Maximum quantity reached</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <motion.button
                onClick={handleAddToCart}
                whileTap={{ scale: 0.97 }}
                className={`flex-1 py-4 text-sm font-body font-medium tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 ${addedToCart ? "bg-green-600 text-background" : "bg-foreground text-background hover:bg-foreground/90"}`}
              >
                {addedToCart ? (
                  <><Check className="w-4 h-4" /> Added!</>
                ) : (
                  <><ShoppingBag className="w-4 h-4" /> Add to Cart</>
                )}
              </motion.button>
              <button className="border border-border p-4 hover:border-primary hover:text-primary transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Stock */}
            <p className={`text-xs font-body mb-8 ${product.inStock ? "text-green-600" : "text-destructive"}`}>
              {product.inStock ? "✓ In Stock — Ready to Ship" : "✕ Out of Stock"}
            </p>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 border border-border">
              <div className="text-center">
                <Truck className="w-5 h-5 mx-auto mb-1.5 text-primary" strokeWidth={1.5} />
                <p className="text-[10px] font-body text-muted-foreground">Free Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="w-5 h-5 mx-auto mb-1.5 text-primary" strokeWidth={1.5} />
                <p className="text-[10px] font-body text-muted-foreground">Quality Assured</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-5 h-5 mx-auto mb-1.5 text-primary" strokeWidth={1.5} />
                <p className="text-[10px] font-body text-muted-foreground">Easy Returns</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20 mb-10">
            <div className="text-center mb-10">
              <p className="text-primary font-body text-xs tracking-[0.3em] uppercase mb-2">More to Love</p>
              <h2 className="font-heading text-3xl md:text-4xl font-light">You May Also Like</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
