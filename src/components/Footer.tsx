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
    <footer id="footer" className="bg-gray-50 border-t border-gray-200 text-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <img src={logo} alt="Bibae Store" className="h-12 w-auto mb-5" />
            <p className="text-gray-500 text-sm leading-relaxed font-body mb-6">
              Premium fashion & baby products. Elegance redefined for the modern family. Handcrafted with love in Pakistan.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2.5 border border-gray-200 bg-white hover:border-primary hover:text-primary hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61587742991679" target="_blank" rel="noopener noreferrer" className="p-2.5 border border-gray-200 bg-white hover:border-primary hover:text-primary hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-lg mb-5 text-primary">Discover</h4>
            <ul className="space-y-3 text-sm font-body">
              {[
                { label: "Shop All", href: "/shop" },
                { label: "New Arrivals", href: "/shop" },
                { label: "The Journal", href: "/blog" },
                { label: "About Us", href: "/about" },
                { label: "Offers", href: "/coupons" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-gray-500 hover:text-primary transition-colors inline-flex items-center gap-1">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg mb-5 text-primary">Support</h4>
            <ul className="space-y-3 text-sm font-body">
              {[
                { label: "Contact Us", href: "/contact" },
                { label: "Reviews", href: "/reviews" },
                { label: "Loyalty Program", href: "/loyalty-program" },
                { label: "Order Tracking", href: "/track" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-gray-500 hover:text-primary transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg mb-5 text-primary">Need Help?</h4>
            <ul className="space-y-4 text-sm font-body text-gray-500">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span className="break-all text-xs">support@bibaestore.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <a href="https://wa.me/923348438007" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  +92 334 8438007
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                Lahore, Pakistan
              </li>
            </ul>
          </div>
        </div>

        {/* SEO Keyword Cluster Section (Semantic Authority) */}
        <div className="mt-14 pt-10 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h5 className="font-heading text-xs uppercase tracking-widest text-gray-900 border-b border-primary/20 pb-2 inline-block">Featured Collections</h5>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <Link href="/shop/category/ladies" className="text-xs text-gray-400 hover:text-primary transition-colors">Ladies Stitched Suits</Link>
                <Link href="/shop/category/kids" className="text-xs text-gray-400 hover:text-primary transition-colors">Girls Party Frocks</Link>
                <Link href="/shop/category/baby-products" className="text-xs text-gray-400 hover:text-primary transition-colors">Baby Cot Bedding Sets</Link>
                <Link href="/shop/category/ladies" className="text-xs text-gray-400 hover:text-primary transition-colors">Handcrafted Boutique Wear</Link>
                <Link href="/shop/category/baby-products" className="text-xs text-gray-400 hover:text-primary transition-colors">Soft Baby Pillows</Link>
              </div>
            </div>
            <div className="md:col-span-2">
              <h5 className="font-heading text-xs uppercase tracking-widest text-gray-900 border-b border-primary/20 pb-2 inline-block mb-4">The Bibaé Mission</h5>
              <p className="text-[11px] text-gray-400 font-body leading-relaxed uppercase tracking-wider">
                Bibaé Store is Pakistan&apos;s leading boutique for premium handcrafted fashion. We specialize in bringing the finest artisan craftsmanship to your wardrobe, from luxury ladies formal wear to the softest nursery essentials for your little ones. Our 2026 collection is inspired by timeless elegance and the vibrant culture of Lahore.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-xs font-body tracking-wider">
            © 2026 Bibae Store. All rights reserved.
          </p>
          <div className="flex gap-4 md:gap-6 text-xs font-body text-gray-400 flex-wrap justify-center md:justify-end">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/shipping-policy" className="hover:text-primary transition-colors">Shipping Info</Link>
            <Link href="/refund-return-policy" className="hover:text-primary transition-colors">Returns</Link>
            <Link href="/wholesale" className="hover:text-primary transition-colors">Wholesale</Link>
            <Link href="/affiliate-program" className="hover:text-primary transition-colors">Affiliates</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
