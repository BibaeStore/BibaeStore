'use client'

import { Users, Construction } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CustomersPage() {
    return (
        <div className="space-y-8 pb-10">
            <div className="space-y-1.5">
                <h1 className="text-3xl font-heading font-bold text-gray-900 tracking-tight">Customers</h1>
                <p className="text-gray-500 font-body text-sm uppercase tracking-[0.1em]">Manage Customer Base</p>
            </div>

            <Card className="bg-white border-gray-200 rounded-[2.5rem] p-12 text-center shadow-sm min-h-[400px] flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                    <Construction className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Under Construction</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                    The Customers management module is currently being built. Check back soon for updates.
                </p>
                <div className="mt-8">
                    <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50">
                        Return to Dashboard
                    </Button>
                </div>
            </Card>
        </div>
    )
}
