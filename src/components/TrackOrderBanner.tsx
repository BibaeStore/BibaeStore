'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrackOrderBanner() {
  const router = useRouter()
  const [trackingNumber, setTrackingNumber] = useState('')

  const handleTrack = () => {
    const trimmed = trackingNumber.trim()
    if (trimmed) {
      router.push(`/track/?number=${encodeURIComponent(trimmed)}`)
    } else {
      router.push('/track/')
    }
  }

  return (
    <section className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <Package className="w-10 h-10 mx-auto mb-4 text-primary" strokeWidth={1.5} />
          <h2 className="font-heading text-3xl md:text-4xl font-light mb-3">Track Your Order</h2>
          <p className="text-background/50 font-body text-sm mb-8">
            Enter your tracking number to check the status of your order
          </p>

          <div className="flex items-center bg-background/10 border border-background/20 max-w-lg mx-auto">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleTrack() }}
              placeholder="Enter tracking number (e.g. BB-20260221-XXXX)"
              className="flex-1 bg-transparent text-background placeholder:text-background/30 px-4 py-3.5 text-sm font-body focus:outline-none"
            />
            <button
              onClick={handleTrack}
              className="bg-primary text-white px-6 py-3.5 text-sm font-body font-medium tracking-wider uppercase hover:bg-primary/90 transition-colors flex items-center gap-2 flex-shrink-0"
            >
              Track <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
