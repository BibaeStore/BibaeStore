'use client'

import { Truck, Shield, RotateCcw, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const badges = [
  { icon: Truck, title: "Nationwide Delivery", desc: "Flat Rs. 200 shipping" },
  { icon: Shield, title: "Premium Quality", desc: "Handcrafted with care" },
  { icon: RotateCcw, title: "Easy Returns", desc: "7-day return policy" },
  { icon: Headphones, title: "24/7 Support", desc: "We're here to help" },
];

export default function TrustBadges() {
  return (
    <section className="border-b border-border">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {badges.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center group"
            >
              <div className="w-14 h-14 mx-auto mb-4 border border-border flex items-center justify-center group-hover:border-primary transition-colors duration-300">
                <b.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <h4 className="font-heading text-lg font-medium mb-1">{b.title}</h4>
              <p className="text-xs font-body text-muted-foreground">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
