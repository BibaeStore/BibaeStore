'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Box, ImageIcon, Loader2, Eye, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ProductService } from '@/services/product.service'
import { CategoryService } from '@/services/category.service'
import { Product, ProductFormData } from '@/types/product'
import { Category } from '@/types/category'
import { ProductFormValues } from '@/lib/validations/product'
import { ProductForm } from './ProductForm'
import { toast } from 'sonner'
import Image from 'next/image'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [viewProduct, setViewProduct] = useState<Product | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const [productsData, categoriesData] = await Promise.all([
                ProductService.getProducts(),
                CategoryService.getCategories()
            ])
            setProducts(productsData)
            setCategories(categoriesData)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load data")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleCreate = () => {
        setEditingProduct(null)
        setIsModalOpen(true)
    }

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setIsModalOpen(true)
    }

    const handleView = (product: Product) => {
        setViewProduct(product)
    }

    const handleDelete = (id: string) => {
        setDeleteId(id)
    }

    const confirmDelete = async () => {
        if (!deleteId) return

        try {
            await ProductService.deleteProduct(deleteId)
            toast.success("Product deleted successfully")
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete product")
        } finally {
            setDeleteId(null)
        }
    }

    const handleSubmit = async (data: ProductFormValues, newFiles: File[], existingImages: string[]) => {
        try {
            const formData: ProductFormData = {
                name: data.name,
                sku: data.sku,
                category_id: data.category_id || null, // Fix: undefined -> null
                short_description: data.short_description,
                description: data.description,
                price: data.price,
                sale_price: data.sale_price || null, // Fix: undefined -> null
                stock: data.stock,
                status: data.status,
                is_featured: data.is_featured,
                newImages: newFiles,
                images: existingImages
            }

            if (editingProduct) {
                await ProductService.updateProduct(editingProduct.id, formData)
                toast.success("Product updated successfully")
            } else {
                await ProductService.createProduct(formData)
                toast.success("Product created successfully")
            }
            fetchData()
            setIsModalOpen(false)
        } catch (error: any) {
            console.error(error)
            if (error.code === 'PGRST205') {
                toast.error("Database table missing. Please apply the SQL script.")
            } else {
                toast.error(editingProduct ? "Failed to update product" : "Failed to create product")
            }
        }
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Products</h1>
                    <p className="text-white/40 font-body text-sm uppercase tracking-[0.1em]">Manage Your Inventory</p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl px-6 text-xs uppercase tracking-widest shadow-xl shadow-primary/10 transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : products.length === 0 ? (
                <Card className="bg-white/[0.02] border-white/5 rounded-[2.5rem] p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <Box className="w-8 h-8 text-white/20" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">No products found</h3>
                            <p className="text-white/40 mt-2">Get started by adding your first product.</p>
                        </div>
                        <Button onClick={handleCreate} variant="outline" className="mt-4 border-white/10 text-white hover:bg-white/5">
                            Create Product
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {/* Desktop Table */}
                    <Card className="hidden md:block bg-white/[0.02] border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <CardHeader className="px-8 pt-8 pb-4">
                            <div className="space-y-1.5">
                                <CardTitle className="font-heading text-xl text-white">All Products</CardTitle>
                                <CardDescription className="text-white/30 text-xs uppercase tracking-widest font-bold">
                                    {products.length} Total Products
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <Table>
                                <TableHeader className="bg-white/[0.02] border-b border-white/5">
                                    <TableRow className="hover:bg-transparent border-white/5">
                                        <TableHead className="w-[80px] py-5 pl-8 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Image</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Name</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">SKU</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Category</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Price</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Stock</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Status</TableHead>
                                        <TableHead className="text-right py-5 pr-8 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product) => (
                                        <TableRow key={product.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                                            <TableCell className="py-4 pl-8">
                                                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden relative">
                                                    {product.images && product.images.length > 0 ? (
                                                        <Image
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-white/20">
                                                            <ImageIcon className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 font-medium text-white/90">
                                                <div className="flex flex-col">
                                                    <span>{product.name}</span>
                                                    {product.is_featured && <span className="text-[10px] text-primary uppercase tracking-wider font-bold">Featured</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 text-white/60 text-sm font-mono">{product.sku}</TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="outline" className="border-white/10 text-white/60">
                                                    {product.category?.name || 'Uncategorized'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 text-white/80">
                                                ${product.price.toFixed(2)}
                                                {product.sale_price && (
                                                    <span className="ml-2 text-xs text-muted-foreground line-through">${product.sale_price.toFixed(2)}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-4 text-white/60">{product.stock}</TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="secondary" className={
                                                    product.status === 'active' ? "bg-green-500/10 text-green-500" :
                                                        product.status === 'draft' ? "bg-yellow-500/10 text-yellow-500" :
                                                            "bg-red-500/10 text-red-500"
                                                }>
                                                    {product.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right py-4 pr-8">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10" onClick={() => handleView(product)}>
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10" onClick={() => handleEdit(product)}>
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(product.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Mobile Cards */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {products.map((product) => (
                            <Card key={product.id} className="bg-white/[0.02] border-white/5 overflow-hidden">
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 overflow-hidden relative flex-shrink-0">
                                            {product.images && product.images.length > 0 ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/20">
                                                    <ImageIcon className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-white font-medium truncate">{product.name}</h4>
                                                    <p className="text-white/40 text-xs font-mono mt-0.5">{product.sku}</p>
                                                </div>
                                                <Badge variant="secondary" className={
                                                    product.status === 'active' ? "bg-green-500/10 text-green-500" :
                                                        product.status === 'draft' ? "bg-yellow-500/10 text-yellow-500" :
                                                            "bg-red-500/10 text-red-500"
                                                }>
                                                    {product.status}
                                                </Badge>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-white font-medium">${product.price.toFixed(2)}</span>
                                                    {product.sale_price && (
                                                        <span className="text-xs text-white/40 line-through">${product.sale_price.toFixed(2)}</span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-white/40">{product.stock} in stock</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                        <Badge variant="outline" className="border-white/10 text-white/60">
                                            <Tag className="w-3 h-3 mr-1" />
                                            {product.category?.name || 'Uncategorized'}
                                        </Badge>

                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10" onClick={() => handleView(product)}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10" onClick={() => handleEdit(product)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 text-white/40 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(product.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <ProductForm
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                initialData={editingProduct}
                categories={categories}
                onSubmit={handleSubmit}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="bg-zinc-950 border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white font-heading text-xl">Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60 font-body">
                            Are you sure you want to delete this product? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white transition-colors">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90 transition-colors">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={!!viewProduct} onOpenChange={(open) => !open && setViewProduct(null)}>
                <DialogContent className="bg-zinc-950 border-white/10 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white font-heading text-2xl">Product Details</DialogTitle>
                        <DialogDescription className="text-white/40">
                            View product information
                        </DialogDescription>
                    </DialogHeader>
                    {viewProduct && (
                        <div className="space-y-6 pt-4">
                            {/* Images Carousel or Display */}
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                {viewProduct.images && viewProduct.images.length > 0 ? (
                                    viewProduct.images.map((img, i) => (
                                        <div key={i} className="relative w-40 h-40 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                                            <Image src={img} alt={`Product ${i}`} fill className="object-cover" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="w-full h-40 flex items-center justify-center text-white/20 bg-white/5 rounded-xl">
                                        <ImageIcon className="w-12 h-12" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-white text-lg font-bold">{viewProduct.name}</h3>
                                    <p className="text-white/40 text-sm">{viewProduct.sku}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-white/40 text-xs uppercase tracking-wider font-bold">Price</p>
                                        <p className="text-white font-medium">${viewProduct.price.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-xs uppercase tracking-wider font-bold">Stock</p>
                                        <p className="text-white font-medium">{viewProduct.stock}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-xs uppercase tracking-wider font-bold">Category</p>
                                        <p className="text-white font-medium">{viewProduct.category?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-xs uppercase tracking-wider font-bold">Status</p>
                                        <Badge variant="secondary" className="mt-1">{viewProduct.status}</Badge>
                                    </div>
                                </div>

                                {viewProduct.description && (
                                    <div>
                                        <p className="text-white/40 text-xs uppercase tracking-wider font-bold mb-1">Description</p>
                                        <p className="text-white/80 text-sm leading-relaxed max-h-32 overflow-y-auto">{viewProduct.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
