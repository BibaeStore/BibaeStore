import AuthPage from '@/components/auth/AuthPage'
import { Suspense } from 'react'

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center bg-gray-50">Loading...</div>}>
            <AuthPage initialMode="login" />
        </Suspense>
    )
}
