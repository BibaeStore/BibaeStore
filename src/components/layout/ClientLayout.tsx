'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isExcluded = pathname === '/login' || pathname?.startsWith('/admin')

    return (
        <>
            {!isExcluded && (
                <React.Suspense fallback={<div className="h-20 bg-background" />}>
                    <Header />
                </React.Suspense>
            )}
            {children}
            {!isExcluded && <Footer />}
        </>
    )
}
