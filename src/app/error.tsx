'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error)
    }, [error])

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-3xl font-heading font-light text-gray-900 mb-4">
                Something went wrong!
            </h1>

            <p className="text-gray-600 font-body mb-10 max-w-md mx-auto">
                We apologize for the inconvenience. An unexpected error has occurred.
                Our team has been notified and we are working to fix it.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button
                    onClick={() => reset()}
                    className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-body font-medium flex items-center gap-2 hover:bg-gold-dark transition-all duration-300 shadow-md"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>

                <Link
                    href="/"
                    className="border border-gray-200 text-gray-700 px-8 py-3 rounded-full font-body font-medium flex items-center gap-2 hover:bg-gray-50 transition-all duration-300"
                >
                    <Home className="w-4 h-4" />
                    Back to Home
                </Link>
            </div>
        </div>
    )
}
