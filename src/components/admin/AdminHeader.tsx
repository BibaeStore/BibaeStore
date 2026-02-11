'use client'

import { Search, Bell, User, Menu } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function AdminHeader() {
    return (
        <header className="h-20 border-b border-border bg-background flex items-center justify-between px-8 sticky top-0 z-30 backdrop-blur-md bg-background/80">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />
                <div className="relative hidden md:block w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search anything..."
                        className="pl-10 h-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
                </Button>
                <div className="h-8 w-px bg-border mx-2 hidden sm:block"></div>
                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold leading-none">Admin User</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-tight mt-1">Super Admin</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">
                        A
                    </div>
                </div>
            </div>
        </header>
    )
}
