'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { createClient } from "./supabase/client";
import { getCartAction, addToCartAction, removeFromCartAction, updateCartQuantityAction, clearCartAction } from "@/lib/cart-actions";
import { toast } from "sonner";

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  [key: string]: any; // Allow other props
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
  size: string;
  color: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: CartProduct, size: string, color: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  // 1. Initial Load and Auth Watch
  useEffect(() => {
    const initCart = async () => {
      // Check auth
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);

      if (session?.user?.id) {
        // Fetch from DB
        try {
          const cartResult = await getCartAction(session.user.id);
          const mappedItems: CartItem[] = (cartResult.data || []).map((item: any) => ({
            product: {
              ...item.product,
              image: item.product.images?.[0] || '/assets/placeholder.jpg'
            },
            quantity: item.quantity,
            size: "Standard",
            color: "Default"
          }));

          // Deduplicate items based on product_id to prevent key collisions
          const uniqueItems = mappedItems.reduce((acc: CartItem[], current) => {
            const existing = acc.find(item => item.product.id === current.product.id);
            if (existing) {
              existing.quantity += current.quantity;
            } else {
              acc.push(current);
            }
            return acc;
          }, []);

          setItems(uniqueItems);
        } catch (error) {
          console.error("Error loading cart from DB:", error);
        }
      } else {
        // Fetch from LocalStorage
        const localData = localStorage.getItem('bibae_cart');
        if (localData) {
          try {
            setItems(JSON.parse(localData));
          } catch (e) {
            console.error("Error parsing local cart:", e);
          }
        }
      }
      setIsLoading(false);
    };

    initCart();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUserId(session?.user?.id || null);
      if (event === 'SIGNED_IN' && session?.user?.id) {
        // Merge: combine guest localStorage cart with DB cart
        const localData = localStorage.getItem('bibae_cart');
        let localItems: CartItem[] = [];
        if (localData) {
          try { localItems = JSON.parse(localData); } catch (e) { /* ignore */ }
        }

        const cartResult = await getCartAction(session.user.id);
        const mappedDbItems: CartItem[] = (cartResult.data || []).map((item: any) => ({
          product: {
            ...item.product,
            image: item.product.images?.[0] || '/assets/placeholder.jpg'
          },
          quantity: item.quantity,
          size: "Standard",
          color: "Default"
        }));

        // Merge local items into DB items
        const merged = [...mappedDbItems];
        for (const localItem of localItems) {
          const existing = merged.find(m => m.product.id === localItem.product.id);
          if (existing) {
            // Item exists in DB, keep the higher quantity
            existing.quantity = Math.max(existing.quantity, localItem.quantity);
          } else {
            // New item from guest cart, add it
            merged.push(localItem);
          }
        }

        // Sync merged items to DB
        for (const localItem of localItems) {
          const inDb = mappedDbItems.find(d => d.product.id === localItem.product.id);
          if (!inDb) {
            try {
              await addToCartAction(session.user.id, localItem.product.id, localItem.quantity);
            } catch (e) {
              console.error("Failed to sync local item to DB:", e);
            }
          }
        }

        setItems(merged);
        localStorage.removeItem('bibae_cart');
      } else if (event === 'SIGNED_OUT') {
        setItems([]);
        localStorage.removeItem('bibae_cart');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // 2. Persist to LocalStorage whenever items change (if not logged in)
  useEffect(() => {
    if (!userId && !isLoading) {
      localStorage.setItem('bibae_cart', JSON.stringify(items));
    }
  }, [items, userId, isLoading]);

  const addItem = async (product: CartProduct, size: string, color: string, quantity: number = 1) => {
    const existing = items.find((i) => i.product.id === product.id && i.size === size && i.color === color);
    const newQuantity = existing ? existing.quantity + quantity : quantity;

    // Update Local State
    setItems((prev) => {
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.size === size && i.color === color
            ? { ...i, quantity: newQuantity }
            : i
        );
      }
      return [...prev, { product, quantity, size, color }];
    });

    // Update DB if logged in
    if (userId) {
      try {
        await addToCartAction(userId, product.id, newQuantity);
      } catch (error) {
        console.error("Failed to sync cart to DB:", error);
        toast.error("Cloud sync failed. Cart saved locally.");
      }
    }
  };

  const removeItem = async (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));

    if (userId) {
      try {
        await removeFromCartAction(userId, productId);
      } catch (error) {
        console.error("Failed to sync removal to DB:", error);
      }
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prev) => prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)));

    if (userId) {
      try {
        await updateCartQuantityAction(userId, productId, quantity);
      } catch (error) {
        console.error("Failed to sync quantity to DB:", error);
      }
    }
  };

  const clearCart = async () => {
    setItems([]);
    if (userId) {
      try {
        await clearCartAction(userId);
      } catch (error) {
        console.error("Failed to clear DB cart:", error);
      }
    } else {
      localStorage.removeItem('bibae_cart');
    }
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isLoading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
