'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const logo = '/Habiba Minhas logo.jpeg'

export default function AdminLoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const supabase = createClient()

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                toast.error(error.message)
                setIsLoading(false)
                return
            }

            if (data.user) {
                const validAdminEmails = [
                    'habibaminhas@gmail.com',
                    process.env.NEXT_PUBLIC_ADMIN_EMAIL
                ]

                if (validAdminEmails.includes(data.user.email)) {
                    toast.success('Admin access granted!')
                    // Fully hard redirect to admin to ensure auth layout runs cleanly with populated cookies.
                    window.location.href = '/admin'
                } else {
                    toast.error('Unauthorized access. Admin only.')
                    await supabase.removeAllChannels()
                    await supabase.auth.signOut()
                    setIsLoading(false)
                }
            }
        } catch (error) {
            toast.error('Connection error. Please try again.')
            setIsLoading(false)
        }
    }

    return (
        <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#fafafa]">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-[80px] opacity-60"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -60, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] bg-gradient-to-tr from-blue-100 to-transparent rounded-full blur-[80px] opacity-70"
                />
                <motion.div
                    animate={{
                        y: [0, -40, 0],
                        x: [0, 20, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-gradient-to-t from-orange-100/50 to-transparent rounded-full blur-[60px]"
                />
            </div>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[420px] px-6"
            >
                <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-[2rem] p-8 md:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] ring-1 ring-black/5 hover:shadow-[0_45px_70px_-15px_rgba(0,0,0,0.25)] transition-all duration-500">
                    <div className="text-center space-y-8">
                        {/* Header Section */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-sm">
                                    <ShieldCheck className="w-8 h-8 text-primary" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-3xl font-heading font-bold text-gray-900 tracking-tight">
                                    Admin Portal
                                </h1>
                                <p className="text-gray-500 text-xs uppercase tracking-[0.2em] font-medium">
                                    Authorized Personnel Only
                                </p>
                            </div>
                        </div>

                        {/* Form Section */}
                        <form onSubmit={handleEmailLogin} className="space-y-6 pt-2 text-left">
                            <div className="space-y-2">
                                <Label className="text-gray-500 text-[10px] uppercase tracking-[0.1em] ml-1 font-semibold">
                                    Admin Email
                                </Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 group-focus-within:bg-primary/10 transition-colors duration-300">
                                        <Mail className="w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                                    </div>
                                    <Input
                                        type="email"
                                        placeholder="admin@habibaminhas.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-14 bg-gray-50/50 border-gray-200 text-gray-900 pl-14 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all duration-300 font-body text-sm placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <Label className="text-gray-500 text-[10px] uppercase tracking-[0.1em] font-semibold">
                                        Security Token
                                    </Label>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 group-focus-within:bg-primary/10 transition-colors duration-300">
                                        <Lock className="w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                                    </div>
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-14 bg-gray-50/50 border-gray-200 text-gray-900 pl-14 pr-12 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all duration-300 font-body text-sm placeholder:text-gray-400"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 bg-gray-900 hover:bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 uppercase text-xs tracking-[0.15em] mt-4 border border-gray-800"
                            >
                                {isLoading ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                    />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Access Dashboard <ArrowRight className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-2">
                    <p className="text-center text-[10px] text-gray-400 font-body tracking-[0.2em] uppercase">
                        Secure Admin Infrastructure • V.2.0
                    </p>
                </div>
            </motion.div>

            {/* Noise Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.4]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "150px", mixBlendMode: 'overlay' as const }} />
        </div>
    )
}
