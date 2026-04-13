'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function AdminHeader() {
    const router = useRouter()

    return (
        <header className="h-16 border-b border-gray-300 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30 transition-all duration-300 shadow-sm">
            <div className="flex items-center gap-4 flex-1">
                <SidebarTrigger className="text-gray-500 hover:text-gray-900 transition-colors hover:bg-gray-100 data-[state=open]:text-gray-900" />

                <div className="relative hidden md:block w-full max-w-sm group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                    <Input
                        placeholder="Search anything..."
                        className="pl-10 h-10 bg-gray-100 border-gray-200 text-gray-900 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:bg-white transition-all duration-300 placeholder:text-gray-400 text-sm w-full hover:bg-gray-50"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
                {/* Status Indicator */}
                <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full hover:bg-primary/15 transition-colors duration-300 cursor-default">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(195,157,64,0.5)]" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">System Live</span>
                </div>
            </div>
        </header>
    )
}
