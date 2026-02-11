'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Lock, ArrowRight, Github, Chrome } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const logo = '/assets/logo.png'

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
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
                toast.success('Logged in successfully')
                // Check if user is admin (simple email check for now based on user request)
                if (data.user.email === 'bibaestore@gmail.com') {
                    router.push('/admin')
                } else {
                    router.push('/')
                }
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.05),transparent),radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.05),transparent)] bg-slate-50 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[10%] right-[5%] w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-8 bg-background p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-border/50 relative z-10 backdrop-blur-sm"
            >
                <div className="text-center">
                    <Link href="/" className="inline-block mb-6">
                        <img src={logo} alt="Bibae Store" className="h-12 w-auto mx-auto" />
                    </Link>
                    <h2 className="text-3xl font-heading font-semibold text-foreground tracking-wide">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground font-body">
                        Please enter your details to sign in to your account
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-xs uppercase tracking-widest font-semibold">Email Address</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-10 h-12 border-border focus:ring-primary focus:border-primary transition-all font-body"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-xs uppercase tracking-widest font-semibold">Password</Label>
                                <a href="#" className="text-xs text-primary hover:underline font-body">Forgot password?</a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-12 border-border focus:ring-primary focus:border-primary transition-all font-body"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-primary focus:ring-primary border-border rounded transition-colors"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground font-body">
                            Remember me
                        </label>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-body uppercase tracking-widest group"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-4 h-4 border-2 border-background border-t-transparent rounded-full"
                                />
                                Signing in...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground font-body tracking-wider">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button type="button" variant="outline" className="h-11 border-border font-body flex items-center gap-2">
                            <Chrome className="w-4 h-4" /> Google
                        </Button>
                        <Button type="button" variant="outline" className="h-11 border-border font-body flex items-center gap-2">
                            <Github className="w-4 h-4" /> Github
                        </Button>
                    </div>
                </form>

                <p className="text-center text-sm text-muted-foreground font-body">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-primary hover:underline font-medium">
                        Join the Bibae Family
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}
