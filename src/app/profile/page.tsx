'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Prevents prerendering error by disabling SSR for the profile page
const ProfileClient = dynamic(() => import('@/components/profile/ProfileClient'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    )
})

export default function ProfilePage() {
    return <ProfileClient />
}
