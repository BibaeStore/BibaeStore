'use client'

import Link from "next/link";
import { motion } from "framer-motion";
const heroBanner = '/assets/hero-banner.jpg';
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative h-[90vh] md:h-[95vh] overflow-hidden bg-gray-100">
      <img
        src={heroBanner}
        alt="Bibae Store Collection"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-lg text-white">
          <motion.div
            initial={{ opacity: 1, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="w-12 h-[2px] bg-primary mb-6"
          />
          <motion.p
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-primary font-body text-sm tracking-[0.3em] uppercase mb-4"
          >
            New Collection 2026
          </motion.p>
          <motion.h1
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="font-heading text-5xl md:text-7xl lg:text-8xl font-light text-white leading-[0.95] mb-6"
          >
            Elegance
            <br />
            <span className="text-primary font-medium italic">Redefined</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-white/80 font-body text-base md:text-lg mb-10 max-w-sm leading-relaxed"
          >
            Discover premium fashion and baby products curated with love and crafted with elegance.
          </motion.p>
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/shop"
              className="group bg-primary border border-primary text-primary-foreground px-10 py-4 text-sm font-body font-medium tracking-widest uppercase hover:bg-gold-dark hover:border-gold-dark transition-all duration-300 flex items-center justify-center gap-2 shadow-button hover:shadow-button-hover hover:-translate-y-0.5 rounded-sm"
            >
              Shop Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/shop?category=Ladies"
              className="border border-white/40 text-white px-10 py-4 text-sm font-body font-medium tracking-widest uppercase hover:bg-white/10 transition-all duration-300 text-center shadow-button hover:shadow-button-hover hover:-translate-y-0.5 rounded-sm"
            >
              Explore
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/40 text-[10px] font-body tracking-[0.3em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-[1px] h-8 bg-white/30"
        />
      </motion.div>
    </section>
  );
}
