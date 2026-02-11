'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ShoppingBag, Heart, Search, Menu, X, User } from "lucide-react";
import { useCart } from "@/lib/cart";
import { motion, AnimatePresence } from "framer-motion";
const logo = '/assets/logo.png';

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Ladies", href: "/shop?category=Ladies" },
  { label: "Kids", href: "/shop?category=Kids" },
  { label: "Baby Products", href: "/shop?category=Baby Products" },
];

export default function Header() {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = pathname + "?" + searchParams.toString();
  const isAdminPath = pathname.startsWith('/admin');

  if (isAdminPath) return null;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const footer = document.getElementById('footer');
      if (footer) {
        const rect = footer.getBoundingClientRect();
        // Check if footer top is within the viewport header area (approx 80px)
        // or if we've scrolled past it.
        // If footer top <= header height, we are overlapping.
        setIsFooterVisible(rect.top <= 80);
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Trigger once on mount to set initial state
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [routeKey]);

  // Determine text color class based on footer visibility
  const textColorClass = isFooterVisible ? "text-background" : "text-foreground";
  const hoverColorClass = isFooterVisible ? "hover:text-primary" : "hover:text-primary"; // Primary is usually gold/yellow, visible on both
  // Logo filter: invert to white if footer visible
  const logoClass = isFooterVisible ? "h-10 md:h-14 w-auto brightness-0 invert" : "h-10 md:h-14 w-auto";

  // Background logic:
  // If scrolled: semi-transparent white (glass) by default.
  // If overlapping footer: transparent (so footer shows through) OR same glass?
  // User asked for "transparent" background.
  // If we make it fully transparent over footer, footer bg (black) shows. Text is white. High contrast. Good.
  // If we make it glass over footer, it might be milky.
  // Let's go with glass normally, and transparent over footer?
  // Or maybe user meant "transparent background" generally?
  // "add the navbar is background transparent don't change that design make it like modern"
  // I'll stick to glass when scrolled normally, and fully transparent when over footer to let footer shine through.

  const headerBgClass = scrolled
    ? (isFooterVisible ? "bg-transparent border-transparent" : "bg-background/80 backdrop-blur-md shadow-sm border-border")
    : "bg-transparent border-transparent";

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${headerBgClass}`}>
      {/* Top bar - Hide when over footer? Or keep? Keep for now but maybe change color */}
      <div className={`text-center py-2 text-[11px] font-body tracking-[0.15em] uppercase transition-colors duration-300 ${isFooterVisible ? "bg-transparent text-background/80" : "bg-foreground text-background"}`}>
        Free Delivery on Orders Over Rs. 5,000 | Premium Quality Guaranteed
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className={`md:hidden p-2 transition-colors ${textColorClass} ${hoverColorClass}`}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src={logo} alt="Bibae Store" className={`transition-all duration-300 ${logoClass}`} />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-body tracking-wider uppercase transition-colors duration-300 relative after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left ${pathname === link.href ? "text-primary after:scale-x-100" : `${isFooterVisible ? "text-background/90" : "text-foreground/70"} ${hoverColorClass}`
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className={`flex items-center gap-1 transition-colors duration-300 ${textColorClass}`}>
            <Link href="/shop" className={`p-2.5 ${hoverColorClass} transition-colors`}>
              <Search className="w-5 h-5" />
            </Link>
            <button className={`p-2.5 ${hoverColorClass} transition-colors hidden md:block`}>
              <Heart className="w-5 h-5" />
            </button>
            <Link href="/login" className={`p-2.5 ${hoverColorClass} transition-colors hidden md:block`}>
              <User className="w-5 h-5" />
            </Link>
            <Link href="/cart" className={`p-2.5 ${hoverColorClass} transition-colors relative`}>
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-border overflow-hidden bg-background"
          >
            <nav className="flex flex-col py-4 px-4 gap-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="py-3 px-2 text-sm font-body tracking-wider uppercase text-foreground/80 hover:text-primary transition-colors border-b border-border/50 block"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
