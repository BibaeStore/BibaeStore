import AuthPage from '@/components/auth/AuthPage'
import { Suspense } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Create an Account',
    description: 'Join Habiba Minhas to track your orders, save your wishlist, and get exclusive offers on premium boutique wear.',
    alternates: {
        canonical: '/signup/',
    },
}

export default function SignupPage() {
    return (
        <>
            {/* Hidden H1 for SEO Raw HTML discoverability since AuthPage is client-side */}
            <h1 className="sr-only">Create an Account - Habiba Minhas</h1>
            <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center bg-gray-50">Loading...</div>}>
                <AuthPage initialMode="signup" />
            </Suspense>
        </>
    )
}
