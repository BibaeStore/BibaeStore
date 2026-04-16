'use client'

import { Gift, Zap, BookOpen, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState, useTransition } from 'react'
import { importAIBlogsAction } from './actions'
import { toast } from 'sonner'

export default function MarketingPage() {
    const [isPending, startTransition] = useTransition()
    const [imported, setImported] = useState(false)

    const handleImport = () => {
        startTransition(async () => {
            const result = await importAIBlogsAction()
            if (result.success) {
                toast.success(result.message)
                setImported(true)
            } else {
                toast.error(result.message)
            }
        })
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-heading font-bold text-gray-900 tracking-tight">Marketing & SEO</h1>
                    <p className="text-gray-500 font-body text-sm uppercase tracking-[0.1em]">Grow your brand with AI authority</p>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-full">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">AI Features Enabled</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* AI Blog Importer Card */}
                <Card className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 border-none rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-primary/30 transition-colors"></div>
                    
                    <div className="relative z-10 space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6">
                            <Zap className="w-8 h-8 text-primary" />
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="text-3xl font-heading font-bold">AI Content Importer</h3>
                            <p className="text-gray-400 font-body max-w-md">
                                Generate and import SEO-optimized blog posts tailored for the Pakistani market (Karachi, Lahore, Islamabad). 
                                Establish topical authority in Velvet Fashion and Organic Baby Care instantly.
                            </p>
                        </div>

                        <ul className="space-y-3 py-4">
                            {[
                                'Localized Keywords (Shaadi, Jora, COD, Pakistan)',
                                'Automatic JSON-LD Schema Integration',
                                'Mobile-First Reading Experience',
                                'Internal Linking to Shop Categories'
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <div className="pt-4 flex flex-wrap gap-4">
                            <Button 
                                onClick={handleImport}
                                disabled={isPending || imported}
                                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-lg h-auto flex items-center gap-3 disabled:opacity-50"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating Content...
                                    </>
                                ) : imported ? (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        Blogs Published!
                                    </>
                                ) : (
                                    <>
                                        <BookOpen className="w-5 h-5" />
                                        Import 3 Localized Blogs
                                    </>
                                )}
                            </Button>
                            
                            {imported && (
                                <Button 
                                    variant="outline" 
                                    className="border-white/20 text-white hover:bg-white/10 px-8 py-6 rounded-2xl font-bold transition-all h-auto"
                                    onClick={() => window.open('/blog', '_blank')}
                                >
                                    View Live Blog
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Secondary Cards */}
                <div className="space-y-8">
                    <Card className="bg-white border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                            <Gift className="w-6 h-6 text-blue-500" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Coupons & Rewards</h4>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            Manage rewards and discount codes to drive repeat purchases during seasonal sales.
                        </p>
                        <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 p-0" disabled>
                            Upcoming Feature →
                        </Button>
                    </Card>

                    <Card className="bg-gray-50 border-dashed border-2 border-gray-200 rounded-[2.5rem] p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
                        <p className="text-gray-400 text-sm font-medium italic">
                            More AI SEO tools are coming soon...
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    )
}

