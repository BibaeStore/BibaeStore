'use client'

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Package, ArrowRight, Home, Copy, MessageCircle, Clock } from "lucide-react";
import { scaleVariants, fadeVariants, staggerContainer, staggerItem } from "@/lib/animations";
import confetti from "canvas-confetti";
import { getOrderSuccessDetailsAction } from "@/app/checkout/success/actions";
import { Order } from "@/types/client";
import { toast } from "sonner";
import { formatPrice } from "@/lib/products";

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const paymentMethod = searchParams.get("method") || "cod";
  const [showConfetti, setShowConfetti] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }

    const fetchOrder = async () => {
      try {
        const result = await getOrderSuccessDetailsAction(orderId);
        if (result.data) setOrder(result.data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();

    // Trigger confetti
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
  }, [orderId, router, showConfetti]);

  if (!orderId) return null;

  const trackingNumber = order?.tracking_number || '';
  const isBankTransfer = paymentMethod === 'online';

  const copyTracking = () => {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      toast.success("Tracking number copied!");
    }
  };

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
            className={`w-20 h-20 rounded-full flex items-center justify-center ${isBankTransfer ? 'bg-amber-500' : 'bg-green-500'}`}
          >
            {isBankTransfer ? (
              <Clock className="w-10 h-10 text-white" strokeWidth={3} />
            ) : (
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            )}
          </motion.div>
        </motion.div>

        {/* Success Message */}
        <motion.div variants={staggerItem} className="text-center mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-light mb-3">
            {isBankTransfer ? 'Order Under Review' : 'Order Confirmed!'}
          </h1>
          <p className="text-muted-foreground font-body text-lg">
            {isBankTransfer
              ? 'Your payment proof is being verified'
              : 'Thank you for your purchase'
            }
          </p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          variants={staggerItem}
          className="bg-background border border-border p-8 mb-6"
        >
          {/* Tracking Number */}
          {trackingNumber && (
            <div className="flex items-center justify-between gap-3 mb-6 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Tracking Number</p>
                  <p className="font-heading text-2xl font-bold text-primary">{trackingNumber}</p>
                </div>
              </div>
              <button onClick={copyTracking} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Copy tracking number">
                <Copy className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* Order Amount */}
          {order && (
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
              <span className="text-sm text-muted-foreground">Order Total</span>
              <span className="font-heading text-xl font-bold">{formatPrice(order.total_amount)}</span>
            </div>
          )}

          {/* Status Message */}
          <div className="space-y-4 text-sm font-body">
            {isBankTransfer ? (
              <>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Payment Proof Received</p>
                    <p className="text-muted-foreground text-xs">We have received your payment screenshot</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-amber-400 flex-shrink-0 mt-0.5 flex items-center justify-center">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-700">Under Review</p>
                    <p className="text-muted-foreground text-xs">Our team will verify your payment and update you within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-muted-foreground">Processing</p>
                    <p className="text-muted-foreground text-xs">Once verified, your order will be prepared</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Order Placed</p>
                    <p className="text-muted-foreground text-xs">Our team will contact you for delivery coordination</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-muted-foreground">Processing</p>
                    <p className="text-muted-foreground text-xs">Your order is being prepared</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-muted-foreground">Dispatched</p>
                    <p className="text-muted-foreground text-xs">You'll be notified when your order is out for delivery</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-muted-foreground">Delivered</p>
                    <p className="text-muted-foreground text-xs">Estimated delivery in 3-5 business days</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-border bg-muted/50 -mx-8 -mb-8 p-6">
            <p className="text-sm text-muted-foreground">
              {isBankTransfer
                ? `Your order #${trackingNumber} is under review. We will verify your payment and update you within 24 hours.`
                : `Your order #${trackingNumber} has been placed! Our team will contact you for delivery coordination.`
              }
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={staggerItem} className="flex flex-col gap-4">
          {trackingNumber && (
            <Link
              href={`/track?number=${trackingNumber}`}
              className="w-full bg-primary text-white py-4 text-center font-body font-medium tracking-wider uppercase hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" /> Track Your Order
            </Link>
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/shop"
              className="flex-1 bg-foreground text-background py-4 text-center font-body font-medium tracking-wider uppercase hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/923348438007"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 border border-green-500 text-green-600 py-4 text-center font-body font-medium tracking-wider uppercase hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div variants={fadeVariants} className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Need help? Visit{" "}
            <a href="https://habibaminhas.com" className="text-primary hover:underline">
              habibaminhas.com
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
