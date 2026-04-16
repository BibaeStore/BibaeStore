import AuthPage from '@/components/auth/AuthPage'
import { Suspense } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Login to Your Account',
    description: 'Log in to your Habiba Minhas account to manage your orders, access your wishlist, and enjoy a personalized shopping experience.',
    alternates: {
        canonical: 'https://habibaminhas.com/login/',
    },
}

export default function LoginPage() {
    return (
        <>
            {/* Hidden H1 for SEO Raw HTML discoverability since AuthPage is client-side */}
            <h1 className="sr-only">Login to Your Account - Habiba Minhas</h1>
            <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center bg-gray-50">Loading...</div>}>
                <AuthPage initialMode="login" />
            </Suspense>
        </>
    )
}
