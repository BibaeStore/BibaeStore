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

const logo = '/assets/logo.png'

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
                toast.success('Admin access granted!')
                // For now, redirect only if it's the admin email, 
                // but usually you'd check roles in a real app
                if (data.user.email === 'bibaestore@gmail.com') {
                    router.push('/admin')
                } else {
                    toast.error('Unauthorized access. Admin only.')
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
        <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#050505]">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.15, 1],
                        x: [0, 40, 0],
                        y: [0, 20, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.25, 1],
                        x: [0, -60, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[100px]"
                />
            </div>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-[420px] px-6"
            >
                <div className="bg-[#0A0A0A]/90 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-[0_40px_100px_rgba(0,0,0,0.9)]">
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-2">
                            <ShieldCheck className="w-8 h-8 text-primary shadow-lg" />
                        </div>

                        <div className="space-y-1">
                            <h1 className="text-2xl font-heading font-bold text-white tracking-tight">
                                Admin Portal
                            </h1>
                            <p className="text-white/30 text-[10px] uppercase tracking-[0.25em] font-medium">
                                Authorized Personnel Only
                            </p>
                        </div>

                        <form onSubmit={handleEmailLogin} className="space-y-5 pt-4 text-left">
                            <div className="space-y-2">
                                <Label className="text-white/40 text-[9px] uppercase tracking-[0.2em] ml-1 font-bold">Admin Email</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-focus-within:text-white transition-colors z-10" />
                                    <Input
                                        type="email"
                                        placeholder="admin@bibaestore.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 bg-white/[0.02] border-white/5 text-white pl-11 rounded-2xl focus:border-primary/40 focus:ring-0 focus:bg-white/[0.04] transition-all font-body text-sm placeholder:text-white/10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <Label className="text-white/40 text-[9px] uppercase tracking-[0.2em] font-bold">Security Token</Label>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-focus-within:text-white transition-colors z-10" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 bg-white/[0.02] border-white/5 text-white pl-11 pr-11 rounded-2xl focus:border-primary/40 focus:ring-0 focus:bg-white/[0.04] transition-all font-body text-sm placeholder:text-white/10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/20 hover:text-white/60 transition-colors z-10"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4 text-primary" /> : <Eye className="w-4 h-4 text-primary" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-xl shadow-primary/10 uppercase text-xs tracking-widest mt-2"
                            >
                                {isLoading ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                                    />
                                ) : (
                                    <>Access Dashboard <ArrowRight className="w-4 h-4" /></>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="mt-8 text-center text-[9px] text-white/10 font-body tracking-[0.4em] uppercase">
                    Secure Admin Infrastructure • V.2.0
                </div>
            </motion.div>

            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    )
}
