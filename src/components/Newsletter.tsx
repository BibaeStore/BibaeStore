'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    toast.success("Welcome to the Bibae family!");
    setEmail("");
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="bg-primary/5 text-gray-900 py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 25% 50%, hsl(var(--primary)) 0%, transparent 50%), radial-gradient(circle at 75% 50%, hsl(var(--primary)) 0%, transparent 50%)"
          }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto text-center"
          >
            <p className="text-primary font-body text-xs tracking-[0.3em] uppercase mb-3">Stay Connected</p>
            <h2 className="font-heading text-4xl md:text-5xl font-light mb-4 text-gray-900">
              Join the <span className="text-primary italic">Bibae</span> Family
            </h2>
            <p className="text-gray-600 font-body text-sm mb-8">
              Subscribe to get early access to new collections, exclusive offers, and styling tips delivered to your inbox.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white border border-gray-300 px-5 py-3.5 text-sm font-body text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-sm transition-all"
                required
              />
              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-primary-foreground px-8 py-3.5 text-sm font-body font-medium tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-gold-dark transition-all shadow-button hover:shadow-button-hover hover:-translate-y-0.5"
              >
                {submitted ? (
                  <>
                    <CheckCircle className="w-4 h-4" /> Subscribed
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Subscribe
                  </>
                )}
              </motion.button>
            </form>

            <p className="text-gray-400 text-xs font-body mt-4">No spam, ever. Unsubscribe anytime.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
