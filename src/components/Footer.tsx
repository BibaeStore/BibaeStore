'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";
const logo = '/assets/logo.png';

export default function Footer() {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');

  if (isAdminPath) return null;

  return (
    <footer id="footer" className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <img src={logo} alt="Bibae Store" className="h-12 w-auto mb-5 brightness-0 invert" />
            <p className="text-background/60 text-sm leading-relaxed font-body mb-6">
              Premium fashion & baby products. Elegance redefined for the modern family. Handcrafted with love in Pakistan.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2.5 border border-background/20 hover:border-primary hover:text-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 border border-background/20 hover:border-primary hover:text-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-lg mb-5 text-primary">Quick Links</h4>
            <ul className="space-y-3 text-sm font-body">
              {[
                { label: "Shop All", href: "/shop" },
                { label: "New Arrivals", href: "/shop" },
                { label: "Best Sellers", href: "/shop" },
                { label: "Sale", href: "/shop" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-background/60 hover:text-primary transition-colors inline-flex items-center gap-1">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg mb-5 text-primary">Categories</h4>
            <ul className="space-y-3 text-sm font-body">
              {[
                { label: "Ladies", href: "/shop?category=Ladies" },
                { label: "Kids", href: "/shop?category=Kids" },
                { label: "Baby Products", href: "/shop?category=Baby Products" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-background/60 hover:text-primary transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg mb-5 text-primary">Contact Us</h4>
            <ul className="space-y-3 text-sm font-body text-background/60">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                support@bibaestore.com
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                +92 300 1234567
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                Lahore, Pakistan
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/40 text-xs font-body tracking-wider">
            © 2026 Bibae Store. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs font-body text-background/40">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Shipping Info</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
