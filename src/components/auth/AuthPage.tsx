'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'

const logo = '/Habiba Minhas logo.jpeg'

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1c-2.97 0-5.46.98-7.28 2.66l-2.54 3.41C3.99 3.47 7.7 1 12 1z" fill="#EA4335" />
    </svg>
)

interface AuthPageProps {
    initialMode?: 'login' | 'signup'
}

export default function AuthPage({ initialMode = 'login' }: AuthPageProps) {
    const router = useRouter()

    // State
    const [isSignUp, setIsSignUp] = useState(initialMode === 'signup')
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Form State
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [profileImage, setProfileImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const supabase = createClient()

    // Sync state if initialMode prop changes (though we handle internal toggle mostly)
    useEffect(() => {
        setIsSignUp(initialMode === 'signup')
    }, [initialMode])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setProfileImage(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isSignUp) {
            // Validations
            if (password !== confirmPassword) {
                toast.error('Passwords do not match')
                return
            }
            if (!phone) {
                toast.error('Phone number is required')
                return
            }
        }

        setIsLoading(true)
        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                            phone_number: phone,
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
                    toast.success('Congratulations! Your account has been created successfully.', {
                        description: 'Now you can login with your credentials.',
                        duration: 5000,
                    })

                    setIsLoading(false)
                    // Redirect to login after a short delay so they see the popup
                    setTimeout(() => {
                        setIsSignUp(false)
                        router.push('/login')
                    }, 2000)
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
                    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'habibaminhas@gmail.com'
                    const isHabibaAdmin = data.user.email === adminEmail || data.user.email === 'habibaminhas@gmail.com'
                    if (isHabibaAdmin) {
                        router.refresh()
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

    const toggleMode = () => {
        const nextState = !isSignUp
        setIsSignUp(nextState)
    }

    return (
        <div className="relative min-h-screen w-full flex overflow-hidden bg-gray-50">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "150px"}} />

            {/* BRANDING PANEL */}
            <motion.div
                initial={false}
                animate={{
                    x: isSignUp ? "100%" : "0%",
                    borderTopRightRadius: isSignUp ? "0px" : "40px",
                    borderBottomRightRadius: isSignUp ? "0px" : "40px",
                    borderTopLeftRadius: isSignUp ? "40px" : "0px",
                    borderBottomLeftRadius: isSignUp ? "40px" : "0px"
                }}
                transition={{ type: "spring", stiffness: 200, damping: 25, mass: 0.8 }}
                className="hidden md:flex absolute top-0 bottom-0 w-1/2 bg-yellow-50/50 backdrop-blur-sm z-20 items-center justify-center p-12 overflow-hidden shadow-2xl border-r border-yellow-100/50"
            >
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <motion.div
                        animate={{
                            scale: [1, 1.15, 1],
                            rotate: [0, 5, -5, 0],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[100px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.25, 1],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] bg-gold/10 rounded-full blur-[80px]"
                    />
                </div>

                <div className="relative z-10 text-center max-w-md space-y-6">
                    <Link href="/" className="inline-block mb-8">
                        <img src={logo} alt="Habiba Minhas" className="h-16 w-auto mx-auto drop-shadow-sm" />
                    </Link>

                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={isSignUp ? "signup-text" : "login-text"}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                                {isSignUp ? "Already One of Us?" : "New Here?"}
                            </h2>
                            <p className="text-gray-600 font-body leading-relaxed mb-8">
                                {isSignUp
                                    ? "Access your dashboard, manage orders, and checkout your favorite items effortlessly."
                                    : "Join our premium boutique community for exclusive offers, early access, and a personalized shopping experience."}
                            </p>
                            <Button
                                type="button"
                                onClick={toggleMode}
                                variant="outline"
                                className="border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-full px-8 py-6 text-sm font-bold tracking-widest uppercase transition-all"
                            >
                                {isSignUp ? "Login to Account" : "Create Account"}
                            </Button>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* FORM PANEL LAYER */}

            {/* Login Form */}
            <motion.div
                className={`absolute top-0 bottom-0 right-0 w-full md:w-1/2 bg-white flex items-center justify-center p-8 z-10 transition-all duration-500 ease-in-out ${isSignUp ? 'opacity-0 pointer-events-none md:pointer-events-none' : 'opacity-100 pointer-events-auto z-20'}`}
            >
                {!isSignUp && (
                    <div className="w-full max-w-[400px] space-y-8">
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-heading font-medium text-gray-900">Account Login</h1>
                            <p className="text-gray-500 text-sm mt-2">Please enter your details to login.</p>
                        </div>

                        <form onSubmit={handleEmailAuth} className="space-y-5">
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-primary/20"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>Password</Label>
                                    <Link href="#" className="text-xs text-primary font-semibold hover:underline">Forgot?</Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-primary/20 pr-10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" disabled={isLoading} className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl font-bold tracking-wide shadow-lg shadow-primary/20">
                                {isLoading ? "Logging In..." : "Login"}
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">Or continue with</span></div>
                        </div>

                        <Button onClick={handleGoogleLogin} disabled={isGoogleLoading} variant="outline" className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50 gap-3">
                            <GoogleIcon />
                            <span className="font-semibold text-gray-700">Google Account</span>
                        </Button>

                        <div className="md:hidden text-center mt-6">
                            <p className="text-sm text-gray-600">
                                Don't have an account? {' '}
                                <button type="button" onClick={toggleMode} className="text-primary font-bold hover:underline">Sign Up</button>
                            </p>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Signup Form */}
            <motion.div
                className={`absolute top-0 bottom-0 left-0 w-full md:w-1/2 bg-white flex items-center justify-center p-8 z-10 transition-all duration-500 ease-in-out ${!isSignUp ? 'opacity-0 pointer-events-none md:pointer-events-none' : 'opacity-100 pointer-events-auto z-20'}`}
            >
                {isSignUp && (
                    <div className="w-full max-w-[400px] space-y-6 max-h-screen overflow-y-auto no-scrollbar py-8">
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-heading font-medium text-gray-900">Create Account</h1>
                            <p className="text-gray-500 text-sm mt-2">Join us for a premium shopping experience.</p>
                        </div>

                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                    type="text"
                                    placeholder="John Doe"
                                    className="h-11 bg-gray-50 border-gray-200 rounded-xl"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input
                                        type="email"
                                        placeholder="your@email.com"
                                        className="h-11 bg-gray-50 border-gray-200 rounded-xl"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input
                                        type="tel"
                                        placeholder="+92 300 0000000"
                                        className="h-11 bg-gray-50 border-gray-200 rounded-xl"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Password</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-11 bg-gray-50 border-gray-200 rounded-xl"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Confirm Password</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-11 bg-gray-50 border-gray-200 rounded-xl"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <Button type="submit" disabled={isLoading} className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl font-bold tracking-wide shadow-lg shadow-primary/20">
                                {isLoading ? "Creating Account..." : "Sign Up"}
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">Or continue with</span></div>
                        </div>

                        <Button onClick={handleGoogleLogin} disabled={isGoogleLoading} variant="outline" className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50 gap-3">
                            <GoogleIcon />
                            <span className="font-semibold text-gray-700">Google Account</span>
                        </Button>

                        <div className="md:hidden text-center mt-6 pb-4">
                            <p className="text-sm text-gray-600">
                                Already have an account? {' '}
                                <button type="button" onClick={toggleMode} className="text-primary font-bold hover:underline">Login</button>
                            </p>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
