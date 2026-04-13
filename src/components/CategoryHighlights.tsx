'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { getNavCategoriesAction } from "@/app/actions/categories";

const fallbackCats = [
  { name: "Ladies", image: '/assets/category-ladies.jpg', href: "/shop/category/ladies" },
  { name: "Kids", image: '/assets/category-kids.jpg', href: "/shop/category/kids" },
  { name: "Accessories", image: '/assets/category-accessories.jpeg', href: "/shop/category/accessories" },
];

// Map category names to fallback images (for categories without image_url)
const fallbackImages: Record<string, string> = {
  "Ladies": '/assets/category-ladies.jpg',
  "Kids": '/assets/category-kids.jpg',
  "Baby Products": '/assets/category-baby.jpg',
  "Accessories": '/assets/category-accessories.jpeg',
};

export default function CategoryHighlights() {
  const [cats, setCats] = useState(fallbackCats);

  useEffect(() => {
    getNavCategoriesAction().then((navCats) => {
      if (navCats.length > 0) {
        setCats(navCats.map((c) => ({
          name: c.name,
          image: fallbackImages[c.name] || '/assets/placeholder.jpg',
          href: `/shop/category/${c.slug}`,
        })));
      }
    }).catch(() => { });
  }, []);

  return (
    <section className="container mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <p className="text-primary font-body text-xs tracking-[0.3em] uppercase mb-2">Collections</p>
        <h2 className="font-heading text-4xl md:text-5xl font-light">Shop by Category</h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cats.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          >
            <Link href={cat.href} className="group block relative overflow-hidden aspect-[3/4] shadow-card hover:shadow-card-hover border border-gray-200 hover:border-primary/50 transition-all duration-500 rounded-sm">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-background">
                <p className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-1">Collection</p>
                <h3 className="font-heading text-3xl font-light">{cat.name}</h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
