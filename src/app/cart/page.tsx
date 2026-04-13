'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Shield, Truck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { buttonPress, fadeVariants } from "@/lib/animations";

export default function Cart() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleRemoveItem = (productId: string) => {
    setRemovingItem(productId);
  };

  const confirmRemove = (productId: string) => {
    removeItem(productId);
    setRemovingItem(null);
    toast.success("Item removed from cart");
  };

  const handleCheckout = () => {
    setIsNavigating(true);
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <ShoppingBag className="w-20 h-20 text-muted-foreground/20 mx-auto mb-6" strokeWidth={1} />
          <h1 className="font-heading text-4xl font-light mb-3">Your Cart is Empty</h1>
          <h2 className="text-muted-foreground font-body text-sm mb-10 max-w-sm mx-auto">
            Looks like you haven't added anything yet. Explore our collection of handcrafted dresses and exclusive accessories.
          </h2>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-foreground text-background px-10 py-4 text-sm font-body font-medium tracking-widest uppercase hover:bg-foreground/90 transition-colors"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="bg-foreground text-background py-12 md:py-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-4xl md:text-5xl font-light"
        >
          Shopping Cart
        </motion.h1>
        <p className="text-background/40 font-body text-sm mt-2">
          {items.length} {items.length === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Items */}
          <div className="lg:col-span-2 space-y-0">
            <h2 className="sr-only">Items in your cart</h2>
            <div className="hidden md:grid grid-cols-[2fr,1fr,1fr,auto] gap-4 pb-4 border-b border-border text-xs font-body text-muted-foreground tracking-wider uppercase">
              <span>Product</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Total</span>
              <span className="w-8" />
            </div>
            {items.map((item, i) => (
              <motion.div
                key={`${item.product.id}-${item.size}-${item.color}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,auto] gap-4 items-center py-6 border-b border-border"
              >
                <div className="flex gap-4">
                  <Link href={`/product/${item.product.id}`} className="w-20 h-24 bg-muted overflow-hidden flex-shrink-0">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex flex-col justify-center">
                    <Link href={`/product/${item.product.id}`} className="font-heading text-lg hover:text-primary transition-colors leading-tight">
                      {item.product.name}
                    </Link>
                    <p className="text-xs font-body text-muted-foreground mt-1">
                      Size: {item.size} • Color: {item.color}
                    </p>
                    <p className="text-sm font-body mt-1">{formatPrice(item.product.price)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="flex items-center border border-border">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-2 hover:bg-muted transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-4 text-sm font-body min-w-[40px] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-2 hover:bg-muted transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-body font-semibold">{formatPrice(item.product.price * item.quantity)}</span>
                </div>

                <button 
                  onClick={() => handleRemoveItem(item.product.id)} 
                  className="text-muted-foreground hover:text-destructive transition-colors p-2"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="bg-muted/50 p-8 sticky top-28 border border-border">
              <h2 className="font-heading text-2xl mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6 text-sm font-body">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatPrice(200)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Truck className="w-3 h-3" /> Standard delivery across Pakistan
                </p>
                <div className="border-t border-border pt-4 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="font-heading">{formatPrice(totalPrice + 200)}</span>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCheckout}
                disabled={isNavigating}
                className="w-full bg-foreground text-background py-4 text-sm font-body font-medium tracking-widest uppercase hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isNavigating ? (
                  <>
                    <LoadingSpinner size="sm" className="border-background border-t-transparent" />
                    Loading...
                  </>
                ) : (
                  <>
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
              <Link href="/shop" className="block text-center mt-4 text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
                Continue Shopping
              </Link>
              <div className="mt-6 pt-4 border-t border-border flex items-center gap-2 text-[10px] text-muted-foreground font-body">
                <Shield className="w-3 h-3 text-primary" />
                Secure checkout — your data is protected
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      <AnimatePresence>
        {removingItem && (
          <motion.div
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setRemovingItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background border border-border p-6 max-w-sm w-full"
            >
              <h3 className="font-heading text-xl mb-2">Remove Item?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to remove this item from your cart?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setRemovingItem(null)}
                  className="flex-1 border border-border py-2.5 text-sm font-body font-medium tracking-wider uppercase hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmRemove(removingItem)}
                  className="flex-1 bg-destructive text-destructive-foreground py-2.5 text-sm font-body font-medium tracking-wider uppercase hover:bg-destructive/90 transition-colors"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
