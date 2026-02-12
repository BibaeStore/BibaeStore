'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { ProductCardItem } from "@/components/ProductCard";

interface WishlistContextType {
  items: ProductCardItem[];
  addToWishlist: (product: ProductCardItem) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: ProductCardItem) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ProductCardItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("wishlist");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse wishlist", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("wishlist", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addToWishlist = (product: ProductCardItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === product.id)) return prev;
      toast.success("Added to wishlist");
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setItems((prev) => {
      const newItems = prev.filter((i) => i.id !== productId);
      if (prev.length !== newItems.length) {
         toast.success("Removed from wishlist");
      }
      return newItems;
    });
  };

  const isInWishlist = (productId: string) => {
    return items.some((i) => i.id === productId);
  };

  const toggleWishlist = (product: ProductCardItem) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const clearWishlist = () => setItems([]);

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
