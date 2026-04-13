'use client'

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ShoppingBag, Heart, Search, Menu, X, User, Minus, Plus, Trash2, PackageSearch } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { formatPrice } from "@/lib/products";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getNavCategoriesAction, NavCategory } from "@/app/actions/categories";
import { ChevronDown } from "lucide-react";

const staticLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop/" },
];

const trailingLinks: { label: string; href: string }[] = [];

export default function Header({ initialCategories = [] }: { initialCategories?: NavCategory[] }) {
  const { items: cartItems, totalItems, totalPrice, updateQuantity, removeItem } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [navCategories, setNavCategories] = useState<NavCategory[]>(initialCategories);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = pathname + "?" + searchParams.toString();
  const isAdminPath = pathname.startsWith('/admin');
  const [session, setSession] = useState<any>(null);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Fetch dynamic categories to keep them fresh
  useEffect(() => {
    getNavCategoriesAction().then(setNavCategories).catch(() => {});
  }, []);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setMobileOpen(false);
    setCartOpen(false);
    setExpandedMobileCategory(null);
  }, [routeKey]);

  // Close cart dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setCartOpen(false);
      }
    };
    if (cartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cartOpen]);

  // Always dark text for light theme
  const textColorClass = "text-foreground";
  const hoverColorClass = "hover:text-primary";
  const logoClass = "h-10 md:h-14 w-auto";

  const headerBgClass = scrolled
    ? "bg-white/80 backdrop-blur-md shadow-soft border-b border-border transition-all duration-300"
    : "bg-transparent border-transparent transition-all duration-300";

  if (isAdminPath) return null;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${headerBgClass}`}>
      {/* Top bar */}
      <div className="text-center py-2 text-[11px] font-body tracking-[0.15em] uppercase transition-colors duration-300 bg-foreground text-background">
        Flat Rs. 200 Delivery Nationwide | Premium Quality Guaranteed
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className={`md:hidden p-2 transition-colors ${textColorClass} ${hoverColorClass}`}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/assets/logo.png" alt="Habiba Minhas" width={160} height={56} priority className={`transition-all duration-300 ${logoClass}`} />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {staticLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-body tracking-wider uppercase transition-colors duration-300 relative after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left ${pathname === link.href ? "text-primary after:scale-x-100" : `text-foreground/70 ${hoverColorClass}`}`}
              >
                {link.label}
              </Link>
            ))}
            {navCategories.map((cat) => (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => {
                  if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                  setHoveredCategory(cat.id);
                }}
                onMouseLeave={() => {
                  hoverTimeoutRef.current = setTimeout(() => setHoveredCategory(null), 150);
                }}
              >
                <Link
                  href={`/shop/category/${cat.slug}/`}
                  className={`text-sm font-body tracking-wider uppercase transition-colors duration-300 relative flex items-center gap-1 after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left ${pathname === `/shop/category/${cat.slug}/` ? "text-primary after:scale-x-100" : `text-foreground/70 ${hoverColorClass}`}`}
                >
                  {cat.name}
                  {cat.subcategories.length > 0 && <ChevronDown className="w-3 h-3" />}
                </Link>
                {/* Subcategory dropdown */}
                <AnimatePresence>
                  {hoveredCategory === cat.id && cat.subcategories.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden py-1"
                    >
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={sub.href}
                          className="block px-4 py-2.5 text-sm font-body text-foreground/70 hover:text-primary hover:bg-gray-50 transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            {trailingLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-body tracking-wider uppercase transition-colors duration-300 relative after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left ${pathname === link.href ? "text-primary after:scale-x-100" : `text-foreground/70 ${hoverColorClass}`}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-2">
            <Link href="/shop/" aria-label="Search Products" className="p-2.5 text-gray-700 hover:text-primary hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-full transition-all duration-300 hover:shadow-sm">
              <Search className="w-5 h-5" />
            </Link>
            <Link href="/wishlist/" aria-label="View Wishlist" className="p-2.5 text-gray-700 hover:text-primary hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-full transition-all duration-300 hover:shadow-sm hidden md:block relative">
              <Heart className="w-5 h-5" />
              {isMounted && wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link href={session ? "/profile/" : "/login/"} aria-label={session ? "Go to Profile" : "Login or Signup"} className="p-2.5 text-gray-700 hover:text-primary hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-full transition-all duration-300 hover:shadow-sm hidden md:block">
              <User className={`w-5 h-5 ${session ? "text-primary" : ""}`} />
            </Link>
            <Link href="/track/" aria-label="Track Your Order" className="p-2.5 text-gray-700 hover:text-primary hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-full transition-all duration-300 hover:shadow-sm hidden md:block">
              <PackageSearch className="w-5 h-5" />
            </Link>
            <div className="relative" ref={cartRef}>
              <button
                onClick={() => setCartOpen(!cartOpen)}
                aria-label={cartOpen ? "Close Cart" : "Open Shopping Cart"}
                className="p-2.5 text-gray-700 hover:text-primary hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-full transition-all duration-300 hover:shadow-sm relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {isMounted && totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </button>

              {/* Cart Dropdown */}
              <AnimatePresence>
                {cartOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">Cart ({totalItems})</h3>
                      <button onClick={() => setCartOpen(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    {/* Items */}
                    {cartItems.length === 0 ? (
                      <div className="p-8 text-center">
                        <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">Your cart is empty</p>
                        <Link href="/shop/" onClick={() => setCartOpen(false)} className="text-xs text-primary font-medium hover:underline mt-2 inline-block">
                          Continue Shopping
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                          {cartItems.map((item) => (
                            <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-3 p-4 hover:bg-gray-50/50 transition-colors">
                              <div className="w-14 h-18 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  {item.size !== 'Default' && item.size} {item.color !== 'Default' && `• ${item.color}`}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                    <button
                                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                      className="p-1 hover:bg-gray-100 transition-colors"
                                    >
                                      <Minus className="w-3 h-3 text-gray-500" />
                                    </button>
                                    <span className="px-2.5 text-xs font-medium min-w-[24px] text-center">{item.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                      className="p-1 hover:bg-gray-100 transition-colors"
                                    >
                                      <Plus className="w-3 h-3 text-gray-500" />
                                    </button>
                                  </div>
                                  <span className="text-sm font-bold text-gray-900">{formatPrice(item.product.price * item.quantity)}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => removeItem(item.product.id)}
                                className="p-1 self-start hover:bg-red-50 hover:text-red-500 rounded transition-colors text-gray-300"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 p-4 bg-gray-50/50">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Subtotal</span>
                            <span className="text-base font-bold text-gray-900">{formatPrice(totalPrice)}</span>
                          </div>
                          <Link
                            href="/cart/"
                            onClick={() => setCartOpen(false)}
                            className="block w-full bg-gray-900 text-white text-center py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors rounded-xl"
                          >
                            View Cart & Checkout
                          </Link>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu — static, no animation blocking clicks */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col py-4 px-4 gap-1">
            {staticLinks.map((link) => (
              <Link key={link.label} href={link.href} className="py-3 px-2 text-sm font-body tracking-wider uppercase text-foreground/80 hover:text-primary transition-colors border-b border-border/50 block">
                {link.label}
              </Link>
            ))}
            {navCategories.map((cat) => (
              <div key={cat.id} className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <Link href={`/shop/category/${cat.slug}/`} className="py-3 px-2 text-sm font-body tracking-wider uppercase text-foreground/80 hover:text-primary transition-colors flex-1">
                    {cat.name}
                  </Link>
                  {cat.subcategories.length > 0 && (
                    <button
                      onClick={() => setExpandedMobileCategory(expandedMobileCategory === cat.id ? null : cat.id)}
                      aria-label={expandedMobileCategory === cat.id ? "Collapse category" : "Expand category"}
                      className="p-2 text-foreground/50 hover:text-primary transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedMobileCategory === cat.id ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
                {expandedMobileCategory === cat.id && cat.subcategories.length > 0 && (
                  <div className="pb-1">
                    {cat.subcategories.map((sub) => (
                      <Link key={sub.id} href={sub.href} className="py-2.5 pl-6 pr-2 text-xs font-body tracking-wider uppercase text-foreground/60 hover:text-primary active:text-primary transition-colors block">
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link href="/track/" className="py-3 px-2 text-sm font-body tracking-wider uppercase text-foreground/80 hover:text-primary transition-colors border-b border-border/50 flex items-center gap-2">
              <PackageSearch className="w-4 h-4" />
              Track Order
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
