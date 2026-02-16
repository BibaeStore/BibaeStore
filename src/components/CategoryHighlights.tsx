'use client'

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
const categoryLadies = '/assets/category-ladies.jpg';
const categoryKids = '/assets/category-kids.jpg';
const categoryBaby = '/assets/category-baby.jpg';

const cats = [
  { name: "Ladies", subtitle: "Ready-to-Wear", image: categoryLadies, href: "/shop/category/ladies" },
  { name: "Kids", subtitle: "Girls Collection", image: categoryKids, href: "/shop/category/kids" },
  { name: "Baby Products", subtitle: "Nursery Essentials", image: categoryBaby, href: "/shop/category/baby-products" },
];

export default function CategoryHighlights() {
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
                <p className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-1">{cat.subtitle}</p>
                <h3 className="font-heading text-3xl font-light">{cat.name}</h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
