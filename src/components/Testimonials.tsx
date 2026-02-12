'use client'

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Ayesha Khan",
    location: "Lahore",
    text: "The quality of Bibae's kurtas is exceptional. Every stitch speaks of craftsmanship. My go-to store for festive wear!",
    rating: 5,
  },
  {
    name: "Fatima Ali",
    location: "Karachi",
    text: "I ordered the Ivory Gold Anarkali and it exceeded all expectations. The fabric, the embroidery — absolutely stunning.",
    rating: 5,
  },
  {
    name: "Sana Malik",
    location: "Islamabad",
    text: "Best baby products I've found online. The cot set is premium quality and my baby loves the soft pillows. Highly recommended!",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <p className="text-primary font-body text-xs tracking-[0.3em] uppercase mb-2">What Our Customers Say</p>
          <h2 className="font-heading text-4xl md:text-5xl font-light">Loved by Thousands</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-background p-8 border border-border relative"
            >
              <Quote className="w-8 h-8 text-primary/20 absolute top-6 right-6" />
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
              <div>
                <p className="font-heading text-lg font-medium">{t.name}</p>
                <p className="font-body text-xs text-muted-foreground">{t.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
