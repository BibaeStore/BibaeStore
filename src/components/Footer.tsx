'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Instagram, Facebook, Youtube, Twitter, Linkedin, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');

  if (isAdminPath) return null;

  return (
    <footer id="footer" className="bg-gray-50 border-t border-gray-200 text-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Image src="/habiba-minhas-logo.jpeg" alt="Habiba Minhas" width={160} height={48} className="h-12 w-auto mb-5" />
            <p className="text-gray-500 text-sm leading-relaxed font-body mb-6">
              Premium fashion & baby products. Elegance redefined for the modern family. Handcrafted with love in Pakistan.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { href: "https://www.instagram.com/habibaminhas/", icon: <Instagram className="w-4 h-4" />, label: "Instagram" },
                { href: "https://www.facebook.com/profile.php?id=61574335512818", icon: <Facebook className="w-4 h-4" />, label: "Facebook" },
                { href: "https://www.youtube.com/channel/UCSx82xy6YKkSgQI1wYuJX1w", icon: <Youtube className="w-4 h-4" />, label: "YouTube" },
                { href: "https://pin.it/58BvOrS7F", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0"/><path d="M9.5 15.5 8 22"/><path d="M12 2a10 10 0 1 0 4 19.17"/></svg>, label: "Pinterest" },
                { href: "https://x.com/habibaminhas", icon: <Twitter className="w-4 h-4" />, label: "X" },
                { href: "https://www.reddit.com/user/Other-Highlight5681/", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 0-.463.327.327 0 0 0-.462 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.231-.094z"/></svg>, label: "Reddit" },
                { href: "https://www.quora.com/profile/Habiba%20Minhas-Store", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.73 18.77c-.78-1.58-1.74-3.16-3.28-3.16-.57 0-1.09.22-1.35.63l-.93-.76c.67-1.01 1.8-1.53 3.19-1.53 1.86 0 3.09.98 4.03 2.5.36-1.27.53-2.87.53-4.77 0-5.82-1.78-8.95-5.02-8.95-3.2 0-4.96 3.13-4.96 8.95 0 5.86 1.76 8.92 4.96 8.92.73 0 1.38-.14 1.94-.42l.89-.41zM9.9 22C5.03 22 1.5 18.13 1.5 11.68 1.5 5.2 5.03 1.32 9.9 1.32c4.88 0 8.4 3.88 8.4 10.36 0 2.25-.34 4.18-.97 5.74 1.01 1.46 2.07 2.13 3.36 2.13.43 0 .79-.07 1.06-.16l.53 1.46c-.6.35-1.38.55-2.32.55-2.04 0-3.6-1.1-4.81-2.89-1.37 1.01-3.11 1.49-5.25 1.49z"/></svg>, label: "Quora" },
                { href: "https://www.linkedin.com/company/habiba-minhas/", icon: <Linkedin className="w-4 h-4" />, label: "LinkedIn" },
                { href: "https://www.tiktok.com/@habibaminhas", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.7a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.13z"/></svg>, label: "TikTok" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="p-2.5 border border-gray-200 bg-white hover:border-primary hover:text-primary hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading text-lg mb-5 text-primary">Discover</h4>
            <ul className="space-y-3 text-sm font-body">
              {[
                { label: "Shop All", href: "/shop/" },
                { label: "New Arrivals", href: "/shop/" },
                { label: "The Journal", href: "/blog/" },
                { label: "About Us", href: "/about/" },
                { label: "Offers", href: "/coupons/" },
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
                { label: "Contact Us", href: "/contact/" },
                { label: "Reviews", href: "/reviews/" },
                { label: "Loyalty Program", href: "/loyalty-program/" },
                { label: "Order Tracking", href: "/track/" },
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
                <span className="break-all text-xs">support@habibaminhas.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <a href="https://wa.me/923120295812" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  +92 312 0295812
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                Karachi, Pakistan, 75533
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
                <Link href="/shop/category/ladies/" className="text-xs text-gray-400 hover:text-primary transition-colors">Ladies Stitched Suits</Link>
                <Link href="/shop/category/kids/" className="text-xs text-gray-400 hover:text-primary transition-colors">Girls Party Frocks</Link>
                <Link href="/shop/category/baby-products/" className="text-xs text-gray-400 hover:text-primary transition-colors">Baby Cot Bedding Sets</Link>
                <Link href="/shop/category/ladies/" className="text-xs text-gray-400 hover:text-primary transition-colors">Handcrafted Boutique Wear</Link>
                <Link href="/shop/category/baby-products/" className="text-xs text-gray-400 hover:text-primary transition-colors">Soft Baby Pillows</Link>
              </div>
            </div>
            <div className="md:col-span-2">
              <h5 className="font-heading text-xs uppercase tracking-widest text-gray-900 border-b border-primary/20 pb-2 inline-block mb-4">The Habiba Minhas Mission</h5>
              <p className="text-[11px] text-gray-400 font-body leading-relaxed uppercase tracking-wider">
                Habiba Minhas is Pakistan&apos;s leading boutique for premium handcrafted fashion. We specialize in bringing the finest artisan craftsmanship to your wardrobe, from luxury ladies formal wear to the softest nursery essentials for your little ones. Our 2026 collection is inspired by timeless elegance and the vibrant culture of Rawalpindi.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-xs font-body tracking-wider">
            © 2026 Habiba Minhas. All rights reserved.
          </p>
          <div className="flex gap-4 md:gap-6 text-xs font-body text-gray-400 flex-wrap justify-center md:justify-end">
            <Link href="/privacy-policy/" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms/" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/shipping-policy/" className="hover:text-primary transition-colors">Shipping Info</Link>
            <Link href="/refund-return-policy/" className="hover:text-primary transition-colors">Returns</Link>
            <Link href="/wholesale/" className="hover:text-primary transition-colors">Wholesale</Link>
            <Link href="/affiliate-program/" className="hover:text-primary transition-colors">Affiliates</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
