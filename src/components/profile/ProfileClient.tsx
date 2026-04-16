'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Camera, LogOut, Package, ShoppingCart, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { getProfileDataAction, updateProfileAction } from '@/app/profile/actions'
import { Client, Order } from '@/types/client'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/products'

export default function ProfileClient() {
    const router = useRouter()
    const supabase = createClient()

    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<Client | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile')

    // Edit State
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [profileImage, setProfileImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        const fetchUserAndProfile = async () => {
            try {
                const result = await getProfileDataAction()
                if (result.error === 'Not authenticated') {
                    router.push('/login')
                    return
                }
                setUser({ id: result.userId })

                if (result.profile) {
                    setProfile(result.profile)
                    setFullName(result.profile.full_name)
                    setPhone(result.profile.phone_number || '')
                    setPreviewUrl(result.profile.profile_image_url || null)
                }
                setOrders(result.orders || [])
            } catch (error) {
                console.error('Error fetching profile data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchUserAndProfile()
    }, [router])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setUpdating(true)
        try {
            const fd = new FormData()
            fd.append('full_name', fullName)
            fd.append('phone_number', phone)
            if (profileImage) fd.append('image', profileImage)

            const result = await updateProfileAction(fd)
            if (result.error) throw new Error(result.error)

            setProfile(result.data)
            toast.success('Profile updated successfully!')
        } catch (error) {
            console.error(error)
            toast.error('Failed to update profile')
        } finally {
            setUpdating(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setProfileImage(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
        toast.success('Logged out successfully')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-sm text-gray-500 font-medium">Loading your profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="font-heading text-xl font-bold text-primary">Habiba Minhas</Link>
                    <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 flex items-center gap-2 text-sm font-medium transition-colors">
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <div className="relative w-24 h-24 mx-auto mb-4 group">
                                <div className="w-full h-full rounded-full overflow-hidden border-4 border-yellow-50 bg-gray-100 relative shadow-inner">
                                    {previewUrl ? (
                                        <Image src={previewUrl} alt="Profile" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                            <User className="w-10 h-10" />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-all scale-90 md:scale-100 ring-2 ring-white">
                                    <Camera className="w-4 h-4" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                            <h2 className="font-heading font-bold text-gray-900 truncate px-2">{profile?.full_name}</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{profile?.email}</p>
                        </div>

                        <nav className="flex flex-col gap-2">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'profile' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
                            >
                                <User className="w-4 h-4" />
                                My Profile
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
                            >
                                <Package className="w-4 h-4" />
                                Orders
                            </button>
                            <Link
                                href="/track"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 transition-all"
                            >
                                <Package className="w-4 h-4" />
                                Track Order
                            </Link>
                            <Link
                                href="/cart"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 transition-all"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                Cart
                            </Link>
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-3">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden"
                        >
                            {activeTab === 'profile' ? (
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
                                        <h3 className="font-heading text-2xl font-bold text-gray-900">Profile Settings</h3>
                                        <p className="text-[10px] text-primary bg-primary/5 px-3 py-1.5 rounded-full font-bold uppercase tracking-widest border border-primary/10">Member Since: {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024'}</p>
                                    </div>

                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-gray-500 font-bold text-[10px] tracking-widest uppercase ml-1">Full Name</Label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <Input
                                                        value={fullName}
                                                        onChange={(e) => setFullName(e.target.value)}
                                                        className="pl-12 h-14 bg-gray-50/50 border-gray-200 rounded-2xl focus:ring-primary/20 focus:bg-white transition-all text-sm"
                                                        placeholder="Enter your full name"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-500 font-bold text-[10px] tracking-widest uppercase ml-1">Email (Verified)</Label>
                                                <div className="relative opacity-60">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <Input
                                                        value={profile?.email}
                                                        disabled
                                                        className="pl-12 h-14 bg-gray-100 border-gray-200 rounded-2xl cursor-not-allowed text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-500 font-bold text-[10px] tracking-widest uppercase ml-1">Phone Number</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <Input
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        className="pl-12 h-14 bg-gray-50/50 border-gray-200 rounded-2xl focus:ring-primary/20 focus:bg-white transition-all text-sm"
                                                        placeholder="+92 312 0295812"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 flex justify-end">
                                            <Button type="submit" disabled={updating} className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-10 h-14 gap-2 shadow-xl shadow-primary/20 font-bold uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95">
                                                {updating ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                                Save Information
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="p-8">
                                    <h3 className="font-heading text-2xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-6">Recent Orders</h3>

                                    {orders.length === 0 ? (
                                        <div className="text-center py-24 px-4">
                                            <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-dashed border-gray-200 rotate-12 group-hover:rotate-0 transition-transform">
                                                <Package className="w-10 h-10 text-gray-300" />
                                            </div>
                                            <h4 className="text-xl font-heading font-bold text-gray-900">Your Wardrobe is Empty</h4>
                                            <p className="text-gray-500 text-sm max-w-xs mx-auto mt-3 leading-relaxed">Discover our latest collections and find something you love.</p>
                                            <Link href="/shop" className="inline-block mt-8 bg-primary text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all">Start Shopping</Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {orders.map((order) => (
                                                <div key={order.id} className="border border-gray-100 rounded-3xl overflow-hidden hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-gray-200/50 group">
                                                    <div className="bg-gray-50/50 p-6 flex flex-wrap items-center justify-between gap-6 border-b border-gray-100 group-hover:bg-white transition-colors">
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">Tracking Number</p>
                                                            <p className="text-sm font-mono font-bold text-primary mt-1">{order.tracking_number || `#${order.id.slice(0, 8).toUpperCase()}`}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">Placement Date</p>
                                                            <p className="text-sm font-bold text-gray-900 mt-1 uppercase">{new Date(order.created_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">Investment</p>
                                                            <p className="text-sm font-bold text-primary mt-1">{formatPrice(order.total_amount)}</p>
                                                        </div>
                                                        <div>
                                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] border ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                order.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                                    'bg-amber-50 text-amber-600 border-amber-100'
                                                                }`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="p-6 space-y-5">
                                                        {order.items?.map((item: any, idx: number) => (
                                                            <div key={idx} className="flex items-center gap-5 group/item">
                                                                <div className="w-16 h-20 rounded-xl bg-gray-50 overflow-hidden relative flex-shrink-0 border border-gray-100 group-hover/item:scale-105 transition-transform shadow-sm">
                                                                    <Image src={item.product?.images?.[0] || '/assets/placeholder.jpg'} alt={item.product?.name} fill className="object-cover" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h5 className="text-sm font-bold text-gray-900 truncate group-hover/item:text-primary transition-colors">{item.product?.name}</h5>
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Qty: {item.quantity} • {formatPrice(item.price)} each</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
