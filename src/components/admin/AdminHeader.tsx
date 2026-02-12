'use client'

import { Search, Bell } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function AdminHeader() {
    return (
        <header className="h-16 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30 transition-all duration-300">
            <div className="flex items-center gap-4 flex-1">
                <SidebarTrigger className="text-white/50 hover:text-white transition-colors hover:bg-white/5 data-[state=open]:text-white" />

                <div className="relative hidden md:block w-full max-w-sm group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors duration-300" />
                    <Input
                        placeholder="Search anything..."
                        className="pl-10 h-10 bg-white/[0.03] border-white/5 text-white rounded-xl focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:bg-white/[0.06] transition-all duration-300 placeholder:text-white/20 text-sm w-full hover:bg-white/[0.04]"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="icon" className="relative w-9 h-9 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all duration-300">
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-[#050505] animate-pulse"></span>
                    </Button>
                </div>

                <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block"></div>

                {/* Quick Action or Status */}
                <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-full hover:bg-primary/10 transition-colors duration-300 cursor-default">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(195,157,64,0.5)]" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">System Live</span>
                </div>
            </div>
        </header>
    )
}
