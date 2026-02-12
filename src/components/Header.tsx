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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = pathname + "?" + searchParams.toString();
  const isAdminPath = pathname.startsWith('/admin');

  if (isAdminPath) return null;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [routeKey]);

  // Always dark text for light theme
  const textColorClass = "text-foreground";
  const hoverColorClass = "hover:text-primary";
  const logoClass = "h-10 md:h-14 w-auto"; 

  const headerBgClass = scrolled
    ? "bg-white/80 backdrop-blur-md shadow-soft border-b border-border transition-all duration-300"
    : "bg-transparent border-transparent transition-all duration-300";

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${headerBgClass}`}>
      {/* Top bar */}
      <div className="text-center py-2 text-[11px] font-body tracking-[0.15em] uppercase transition-colors duration-300 bg-foreground text-background">
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
                className={`text-sm font-body tracking-wider uppercase transition-colors duration-300 relative after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left ${pathname === link.href ? "text-primary after:scale-x-100" : `text-foreground/70 ${hoverColorClass}`
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-2">
            <Link href="/shop" className="p-2.5 text-gray-700 hover:text-primary hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-full transition-all duration-300 hover:shadow-sm">
              <Search className="w-5 h-5" />
            </Link>
            <button className="p-2.5 text-gray-700 hover:text-primary hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-full transition-all duration-300 hover:shadow-sm hidden md:block">
              <Heart className="w-5 h-5" />
            </button>
            <Link href="/login" className="p-2.5 text-gray-700 hover:text-primary hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-full transition-all duration-300 hover:shadow-sm hidden md:block">
              <User className="w-5 h-5" />
            </Link>
            <Link href="/cart" className="p-2.5 text-gray-700 hover:text-primary hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-full transition-all duration-300 hover:shadow-sm relative">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm"
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
