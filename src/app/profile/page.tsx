'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Camera, LogOut, Package, Star, ShoppingCart, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { ClientService } from '@/services/client.service'
import { OrderService } from '@/services/order.service'
import { Client, Order } from '@/types/client'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/products'

export default function ProfilePage() {
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
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUser(user)

            const [profileData, ordersData] = await Promise.all([
                ClientService.getProfile(user.id),
                OrderService.getOrders(user.id)
            ])

            if (profileData) {
                setProfile(profileData)
                setFullName(profileData.full_name)
                setPhone(profileData.phone_number || '')
                setPreviewUrl(profileData.profile_image_url || null)
            }
            setOrders(ordersData)
            setLoading(false)
        }

        fetchUserAndProfile()
    }, [supabase, router])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setUpdating(true)
        try {
            const updatedProfile = await ClientService.updateProfile(user.id, {
                full_name: fullName,
                phone_number: phone
            }, profileImage || undefined)

            setProfile(updatedProfile)
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
        toast.success('Logged out successfully')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="font-heading text-xl font-bold text-primary">Bibaé Store</Link>
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
                                <div className="w-full h-full rounded-full overflow-hidden border-4 border-yellow-50 bg-gray-100 relative">
                                    {previewUrl ? (
                                        <Image src={previewUrl} alt="Profile" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                            <User className="w-10 h-10" />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-all scale-90 md:scale-100">
                                    <Camera className="w-4 h-4" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                            <h2 className="font-heading font-bold text-gray-900">{profile?.full_name}</h2>
                            <p className="text-xs text-gray-500 font-body">{profile?.email}</p>
                        </div>

                        <nav className="flex flex-col gap-1">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'}`}
                            >
                                <User className="w-4 h-4" />
                                My Profile
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'}`}
                            >
                                <Package className="w-4 h-4" />
                                Order History
                            </button>
                            <Link
                                href="/cart"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 transition-all"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                My Cart
                            </Link>
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-3">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            {activeTab === 'profile' ? (
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="font-heading text-2xl font-bold text-gray-900">Personal Information</h3>
                                        <p className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border">Client ID: {user?.id.slice(0, 8)}...</p>
                                    </div>

                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-gray-700 font-semibold text-xs tracking-wider uppercase">Full Name</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <Input
                                                        value={fullName}
                                                        onChange={(e) => setFullName(e.target.value)}
                                                        className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-primary/20"
                                                        placeholder="Enter your full name"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-700 font-semibold text-xs tracking-wider uppercase">Email Address</Label>
                                                <div className="relative opacity-60">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <Input
                                                        value={profile?.email}
                                                        disabled
                                                        className="pl-10 h-12 bg-gray-100 border-gray-200 rounded-xl cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-700 font-semibold text-xs tracking-wider uppercase">Phone Number</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <Input
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-primary/20"
                                                        placeholder="+92 300 1234567"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-end">
                                            <Button type="submit" disabled={updating} className="bg-primary hover:bg-primary/90 rounded-xl px-8 h-12 gap-2 shadow-lg shadow-primary/20">
                                                {updating ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                                Save Changes
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="p-8">
                                    <h3 className="font-heading text-2xl font-bold text-gray-900 mb-8">Order History</h3>

                                    {orders.length === 0 ? (
                                        <div className="text-center py-20 px-4">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                                                <Package className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <h4 className="text-gray-900 font-heading font-medium">No orders yet</h4>
                                            <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2">Looks like you haven't placed any orders. Start shopping to see your history here!</p>
                                            <Link href="/shop" className="inline-block mt-6 text-primary font-bold hover:underline">Explore Products</Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {orders.map((order) => (
                                                <div key={order.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:border-primary/30 transition-all hover:shadow-md group">
                                                    <div className="bg-gray-50/50 p-4 flex flex-wrap items-center justify-between gap-4 border-b">
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Order ID</p>
                                                            <p className="text-sm font-medium text-gray-900">#{order.id.slice(0, 8)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Date</p>
                                                            <p className="text-sm font-medium text-gray-900">{new Date(order.created_at!).toLocaleDateString()}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Total</p>
                                                            <p className="text-sm font-bold text-primary">{formatPrice(order.total_amount)}</p>
                                                        </div>
                                                        <div>
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                        'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 space-y-4">
                                                        {order.items?.map((item: any, idx: number) => (
                                                            <div key={idx} className="flex items-center gap-4">
                                                                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden relative flex-shrink-0 border border-gray-100">
                                                                    <Image src={item.product?.images?.[0] || '/assets/placeholder.jpg'} alt={item.product?.name} fill className="object-cover" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h5 className="text-sm font-medium text-gray-900 truncate">{item.product?.name}</h5>
                                                                    <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
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
