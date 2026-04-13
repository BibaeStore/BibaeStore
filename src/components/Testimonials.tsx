'use client'

import { motion } from "framer-motion";
import { Star, Quote, ExternalLink } from "lucide-react";
import Link from "next/link";

const testimonials = [
  {
    name: "Ayesha Khan",
    location: "Lahore",
    text: "The quality of Habiba Minhas's kurtas is exceptional. Every stitch speaks of craftsmanship. My go-to store for festive wear!",
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

        {/* Review CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-14 max-w-2xl mx-auto"
        >
          <p className="text-center text-sm text-muted-foreground mb-5">Loved your experience? Share it with the world!</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://www.trustpilot.com/review/habibaminhas.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 px-6 py-3 border-2 border-gray-200 bg-white rounded-sm hover:border-[#00b67a] transition-all group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#00b67a" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Review on Trustpilot</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#00b67a]" />
            </a>
            <Link
              href="/reviews"
              className="flex items-center justify-center gap-2.5 px-6 py-3 border-2 border-gray-200 bg-white rounded-sm hover:border-primary transition-all group"
            >
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm font-medium text-gray-900">Review on Habiba Minhas</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
