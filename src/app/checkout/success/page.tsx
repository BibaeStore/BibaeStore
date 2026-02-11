'use client'

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Package, ArrowRight, Home } from "lucide-react";
import { scaleVariants, fadeVariants, staggerContainer, staggerItem } from "@/lib/animations";
import confetti from "canvas-confetti";

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!orderNumber) {
      router.push("/");
      return;
    }

    // Trigger confetti animation
    if (!showConfetti) {
      setShowConfetti(true);
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#D4AF37', '#FFD700', '#FFA500'],
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#D4AF37', '#FFD700', '#FFA500'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [orderNumber, router, showConfetti]);

  if (!orderNumber) return null;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-2xl w-full"
      >
        {/* Success Icon */}
        <motion.div variants={staggerItem} className="flex justify-center mb-8">
          <motion.div
            variants={scaleVariants}
            className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center"
          >
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </motion.div>
        </motion.div>

        {/* Success Message */}
        <motion.div variants={staggerItem} className="text-center mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-light mb-3">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground font-body text-lg">
            Thank you for your purchase
          </p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          variants={staggerItem}
          className="bg-background border border-border p-8 mb-6"
        >
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
            <Package className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-heading text-xl">{orderNumber}</p>
            </div>
          </div>

          <div className="space-y-4 text-sm font-body">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Order Confirmed</p>
                <p className="text-muted-foreground text-xs">We've received your order and will begin processing it shortly</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-muted-foreground">Processing</p>
                <p className="text-muted-foreground text-xs">Your order is being prepared for shipment</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-muted-foreground">Shipped</p>
                <p className="text-muted-foreground text-xs">You'll receive tracking information via email</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-muted-foreground">Delivered</p>
                <p className="text-muted-foreground text-xs">Estimated delivery in 3-5 business days</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border bg-muted/50 -mx-8 -mb-8 p-6">
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to your email address with order details and tracking information.
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/shop"
            className="flex-1 bg-foreground text-background py-4 text-center font-body font-medium tracking-wider uppercase hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="flex-1 border border-border py-4 text-center font-body font-medium tracking-wider uppercase hover:bg-muted transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Back to Home
          </Link>
        </motion.div>

        {/* Additional Info */}
        <motion.div variants={fadeVariants} className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Need help? Contact us at{" "}
            <a href="mailto:support@bibaestore.com" className="text-primary hover:underline">
              support@bibaestore.com
            </a>
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Order Details...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
