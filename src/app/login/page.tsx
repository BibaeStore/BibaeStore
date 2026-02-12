'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const logo = '/assets/logo.png'

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
    </svg>
)

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const supabase = createClient()

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                        },
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                })

                if (error) {
                    toast.error(error.message)
                    setIsLoading(false)
                    return
                }

                if (data.user) {
                    toast.success('Registration successful! Please check your email.')
                    setIsSignUp(false)
                    setIsLoading(false)
                }
            } else {
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
                    toast.success('Welcome back!')
                    if (data.user.email === 'bibaestore@gmail.com') {
                        router.push('/admin')
                    } else {
                        router.push('/')
                    }
                }
            }
        } catch (error) {
            toast.error('Connection error. Please try again.')
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) {
                toast.error(error.message)
                setIsGoogleLoading(false)
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
            setIsGoogleLoading(false)
        }
    }

    return (
        <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-50">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.15, 1],
                        x: [0, 60, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[15%] -left-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.25, 1],
                        x: [0, -80, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[15%] -right-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"
                />
            </div>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-[420px] px-6"
            >
                <div className="bg-white/80 backdrop-blur-2xl border border-gray-200 rounded-[2rem] p-7 md:p-9 shadow-xl shadow-gray-200/50">
                    <div className="text-center space-y-5">
                        <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                            <img src={logo} alt="Bibae Store" className="h-10 w-auto mx-auto" />
                        </Link>

                        <div className="space-y-1">
                            <h1 className="text-xl font-heading font-medium text-gray-900 tracking-tight">
                                {isSignUp ? 'Create Account' : 'Account Sign In'}
                            </h1>
                            <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em]">
                                Premium Boutique Experience
                            </p>
                        </div>

                        <form onSubmit={handleEmailAuth} className="space-y-4 pt-2 text-left">
                            {isSignUp && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-1.5"
                                >
                                    <Label className="text-gray-500 text-[9px] uppercase tracking-[0.2em] ml-1">Full Name</Label>
                                    <Input
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-11 bg-gray-50 border-gray-200 text-gray-900 px-4 rounded-xl focus:border-primary/60 focus:ring-0 focus:bg-white transition-all font-body text-sm placeholder:text-gray-400"
                                        required={isSignUp}
                                    />
                                </motion.div>
                            )}

                            <div className="space-y-1.5">
                                <Label className="text-gray-500 text-[9px] uppercase tracking-[0.2em] ml-1">Email</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-focus-within:text-primary transition-colors z-10" />
                                    <Input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-11 bg-gray-50 border-gray-200 text-gray-900 pl-10 rounded-xl focus:border-primary/60 focus:ring-0 focus:bg-white transition-all font-body text-sm placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <Label className="text-gray-500 text-[9px] uppercase tracking-[0.2em]">Password</Label>
                                    {!isSignUp && (
                                        <Link href="#" className="text-[9px] text-primary/80 hover:text-primary uppercase tracking-[0.1em] transition-colors">Forgot?</Link>
                                    )}
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-focus-within:text-primary transition-colors z-10" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-11 bg-gray-50 border-gray-200 text-gray-900 pl-10 pr-10 rounded-xl focus:border-primary/60 focus:ring-0 focus:bg-white transition-all font-body text-sm placeholder:text-gray-400"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors z-10"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 bg-primary hover:bg-gold-dark text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-primary/20"
                            >
                                {isLoading ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                                    />
                                ) : (
                                    <>{isSignUp ? 'Sign Up' : 'Sign In'} <ArrowRight className="w-4 h-4" /></>
                                )}
                            </Button>
                        </form>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-[9px] uppercase">
                                <span className="bg-white px-3 text-gray-400 tracking-[0.3em]">Or continue with</span>
                            </div>
                        </div>

                        <Button
                            onClick={handleGoogleLogin}
                            disabled={isGoogleLoading}
                            variant="outline"
                            className="w-full h-11 bg-transparent hover:bg-gray-50 border-gray-200 text-gray-600 font-medium rounded-xl flex items-center justify-center gap-3 transition-all"
                        >
                            {isGoogleLoading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full"
                                />
                            ) : (
                                <>
                                    <GoogleIcon />
                                    <span className="text-xs text-gray-600 tracking-wide">Google Account</span>
                                </>
                            )}
                        </Button>

                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-gray-400 text-[10px] font-body pt-1 hover:text-primary transition-colors block w-full text-center"
                        >
                            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Join community"}
                        </button>
                    </div>
                </div>

                <div className="mt-6 text-center text-[8px] text-gray-300 font-body tracking-[0.5em] uppercase">
                    Bibae Boutique Hub • Est 2026
                </div>
            </motion.div>

            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    )
}
