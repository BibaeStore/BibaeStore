import { Metadata } from 'next'
import { Suspense } from 'react'
import { Package, Loader2 } from 'lucide-react'
import TrackingContent from './TrackingContent'

export const metadata: Metadata = {
    title: 'Track Your Order',
    description: 'Track the status of your Habiba Minhas order in real-time. Simply enter your tracking number to get updates on your premium boutique wear delivery.',
    alternates: {
        canonical: 'https://habibaminhas.com/track/',
    },
}

export default function TrackPage() {
    return (
        <main className="min-h-screen bg-muted/30">
            {/* Header - RENDERED ON SERVER for SEO/H1 discoverability */}
            <div className="bg-foreground text-background py-16 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    <Package
                        className="w-12 h-12 text-background/20 mx-auto mb-6"
                        strokeWidth={1}
                    />
                    <h1 className="font-heading text-4xl md:text-5xl font-light mb-3">
                        Track Your Order
                    </h1>
                    <p className="text-background/40 font-body text-sm max-w-md mx-auto">
                        Enter your tracking number to see the current status of your order
                    </p>
                </div>
            </div>

            {/* Client-side interactive part */}
            <Suspense
                fallback={
                    <div className="container mx-auto px-4 -mt-8">
                        <div className="max-w-2xl mx-auto bg-background border border-border p-8 text-center shadow-lg">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                            <p className="mt-4 text-sm text-muted-foreground font-body">Initializing tracker...</p>
                        </div>
                    </div>
                }
            >
                <TrackingContent />
            </Suspense>
        </main>
    )
}
