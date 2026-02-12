'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { products, categories } from '@/lib/products'
import { CategoryService } from '@/services/category.service'
import { ProductService } from '@/services/product.service'
import { formatDate } from '@/lib/utils'

export default function SeedPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [progress, setProgress] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const log = (message: string) => {
        setProgress(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    }

    const handleSeed = async () => {
        try {
            setIsLoading(true)
            setError(null)
            setSuccess(false)
            setProgress([])
            
            log('Starting database seed...')

            // 1. Seed Categories
            log('Seeding Categories...')
            const categoryMap = new Map<string, string>() // Name -> ID

            for (const cat of categories) {
                // Check if exists
                // const existing = await CategoryService.getCategories().then(cats => cats.find(c => c.name === cat.name))
                // if (existing) {
                //     categoryMap.set(cat.name, existing.id)
                //     log(`Category "${cat.name}" already exists.`)
                //     continue
                // }

                // Create Main Category
                log(`Creating category: ${cat.name}`)
                const newCat = await CategoryService.createCategory({
                    name: cat.name,
                    parent_id: null,
                    image_url: null, // Could map an image if available
                    status: 'active',
                    sort_order: 0
                })
                categoryMap.set(cat.name, newCat.id)

                // Create Subcategories
                if (cat.subcategories) {
                    for (const sub of cat.subcategories) {
                         log(`Creating subcategory: ${sub.name} (Parent: ${cat.name})`)
                         await CategoryService.createCategory({
                            name: sub.name,
                            parent_id: newCat.id,
                            image_url: null,
                            status: sub.active ? 'active' : 'inactive',
                            sort_order: 0
                        })
                        // We might need subcategory ID mapping too if products use subcategories
                        // But currently products link to Main Category for filtering simplicity
                    }
                }
            }
            log('Categories seeded successfully.')

            // 2. Seed Products
            log(`Seeding ${products.length} Products...`)
            
            for (const product of products) {
                log(`Processing product: ${product.name}`)
                
                // Get Category ID
                const categoryId = categoryMap.get(product.category)
                if (!categoryId) {
                    log(`Error: Category "${product.category}" not found for product "${product.name}". Skipping.`)
                    continue
                }

                // Fetch Image Blob
                let imageFile: File | undefined
                try {
                    const response = await fetch(product.image)
                    const blob = await response.blob()
                    const fileName = product.image.split('/').pop() || 'image.jpg'
                    imageFile = new File([blob], fileName, { type: blob.type })
                } catch (err) {
                    log(`Warning: Failed to fetch image for "${product.name}". Using placeholder path.`)
                }

                // Create Product
                await ProductService.createProduct({
                    name: product.name,
                    sku: `SKU-${Math.random().toString(36).substring(7).toUpperCase()}`, // Generate SKU
                    category_id: categoryId,
                    price: product.price,
                    sale_price: product.originalPrice || null,
                    stock: 50, // Default stock
                    status: 'active',
                    is_featured: product.isFeatured || false,
                    short_description: product.description.substring(0, 100),
                    description: product.description,
                    images: [], // We upload newImages
                    newImages: imageFile ? [imageFile] : []
                })
            }

            log('Products seeded successfully.')
            setSuccess(true)

        } catch (err: any) {
            console.error(err)
            setError(err.message || 'An error occurred during seeding.')
            log(`Error: ${err.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-heading font-bold text-gray-900 tracking-tight">Database Seeder</h1>
                    <p className="text-gray-500 font-body text-sm uppercase tracking-[0.1em]">Migrate Static Data to Supabase</p>
                </div>
            </div>

            <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                    <CardTitle>Migration Control</CardTitle>
                    <CardDescription>Click the button below to populate your database with initial data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 text-sm">
                            <XCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="bg-green-50 text-green-600 p-4 rounded-lg flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-5 h-5" />
                            Database seeded successfully!
                        </div>
                    )}

                    <Button 
                        onClick={handleSeed} 
                        disabled={isLoading || success}
                        className="w-full h-12 text-lg font-bold"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Seeding...
                            </>
                        ) : success ? (
                            "Seeding Complete"
                        ) : (
                            "Start Seeding"
                        )}
                    </Button>

                    <div className="bg-gray-900 text-gray-300 font-mono text-xs p-4 rounded-lg h-64 overflow-y-auto">
                        {progress.length === 0 ? (
                            <span className="text-gray-500">Waiting to start...</span>
                        ) : (
                            progress.map((line, i) => (
                                <div key={i} className="mb-1">{line}</div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
