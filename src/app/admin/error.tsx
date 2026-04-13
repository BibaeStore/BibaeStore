'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert, RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('[AdminError Boundary]:', error)
    }, [error])

    const isUnauthorized = error.message?.includes('Unauthorized') || error.message?.includes('auth')

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#fafafa] p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.05),transparent_50%)] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-red-500/5 text-center relative z-10 border border-red-100"
            >
                <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-8 border border-red-100">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>

                <h2 className="text-2xl font-bold font-heading text-gray-900 mb-4">
                    {isUnauthorized ? "Access Denied" : "System Error"}
                </h2>

                <p className="text-gray-500 text-sm mb-8 font-body leading-relaxed">
                    {isUnauthorized
                        ? "You do not have the required administrative privileges to view this area. The incident has been logged."
                        : error.message || "An unexpected error occurred within the dashboard infrastructure. Please try again or contact support."}
                </p>

                <div className="flex flex-col gap-3">
                    {isUnauthorized ? (
                        <Link href="/admin/login" className="w-full">
                            <Button className="w-full h-12 rounded-xl bg-gray-900 border-gray-800 hover:bg-black font-semibold text-white uppercase tracking-wider text-xs shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                <ShieldAlert className="w-4 h-4 mr-2" />
                                Return to Secure Login
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            onClick={reset}
                            className="w-full h-12 rounded-xl bg-gray-900 border-gray-800 hover:bg-black font-semibold text-white uppercase tracking-wider text-xs shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Attempt Recovery
                        </Button>
                    )}

                    <Link href="/" className="w-full">
                        <Button variant="outline" className="w-full h-12 rounded-xl font-semibold text-gray-600 uppercase tracking-wider text-xs hover:bg-gray-50 border-gray-200 transaction-all">
                            <Home className="w-4 h-4 mr-2" />
                            Back to Website
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
