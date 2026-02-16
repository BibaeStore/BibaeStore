'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Pencil, Trash2, Box, ImageIcon, Loader2, Eye, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ProductService } from '@/services/product.service'
import { CategoryService } from '@/services/category.service'
import { Product } from '@/types/product'
import { Category } from '@/types/category'
import { ProductFormValues } from '@/lib/validations/product'
import { ProductForm } from './ProductForm'
import { uploadProductImage, createProductAction, updateProductAction, deleteProductAction } from './actions'
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

const PRODUCTS_PER_PAGE = 20

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [viewProduct, setViewProduct] = useState<Product | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    // Pagination
    const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE)
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * PRODUCTS_PER_PAGE
        return products.slice(start, start + PRODUCTS_PER_PAGE)
    }, [products, currentPage])

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
        const idToDelete = deleteId
        setDeleteId(null)

        // Optimistic: remove from state immediately
        setProducts(prev => prev.filter(p => p.id !== idToDelete))
        // Adjust page if the current page is now empty
        const remainingCount = products.length - 1
        const newTotalPages = Math.ceil(remainingCount / PRODUCTS_PER_PAGE)
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages)
        }

        try {
            const result = await deleteProductAction(idToDelete)
            if (result.error) throw new Error(result.error)
            toast.success("Product deleted successfully")
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete product. Refreshing list...")
            // Rollback: re-fetch if delete failed
            fetchData()
        }
    }

    const handleSubmit = async (data: ProductFormValues, newFiles: File[], existingImages: string[]) => {
        try {
            // Step 1: Upload new images via server action (one at a time)
            const imageUrls = [...existingImages]
            for (const file of newFiles) {
                const fd = new FormData()
                fd.append('file', file)
                const uploadResult = await uploadProductImage(fd)
                if (uploadResult.error) throw new Error(uploadResult.error)
                imageUrls.push(uploadResult.url!)
            }

            // Step 2: Build product data (all serializable, no File objects)
            const productData = {
                name: data.name,
                sku: data.sku,
                category_id: data.category_id === 'null' ? null : (data.category_id || null),
                images: imageUrls,
                short_description: data.short_description || '',
                description: data.description || '',
                price: data.price,
                sale_price: data.sale_price || null,
                stock: data.stock,
                status: data.status,
                is_featured: data.is_featured,
                slug: data.slug || null,
                meta_title: data.meta_title || null,
                meta_description: data.meta_description || null,
                keywords: data.keywords ? data.keywords.split(',').map(k => k.trim()).filter(Boolean) : null,
                variants: data.variants || {},
                size_guide: data.size_guide || null,
            }

            // Step 3: Create or update via server action
            if (editingProduct) {
                const result = await updateProductAction(editingProduct.id, productData)
                if (result.error) throw Object.assign(new Error(result.error), { code: result.code })
                setProducts(prev => prev.map(p => p.id === editingProduct.id ? (result.data as unknown as Product) : p))
                toast.success("Product updated successfully")
            } else {
                const result = await createProductAction(productData)
                if (result.error) throw Object.assign(new Error(result.error), { code: result.code })
                setProducts(prev => [(result.data as unknown as Product), ...prev])
                setCurrentPage(1)
                toast.success("Product created successfully")
            }
            setIsModalOpen(false)
        } catch (error: any) {
            console.error('Product save error:', error)
            const message = error?.message || ''
            if (error?.code === 'PGRST205') {
                toast.error("Database table missing. Please apply the SQL script.")
            } else if (error?.code === '23505') {
                toast.error("A product with this SKU already exists.")
            } else if (message.includes('Upload')) {
                toast.error(message)
            } else if (message.includes('authenticated')) {
                toast.error("Session expired. Please refresh the page and log in again.")
            } else {
                toast.error(editingProduct ? "Failed to update product" : "Failed to create product")
            }
            throw error
        }
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-heading font-bold text-gray-900 tracking-tight">Products</h1>
                    <p className="text-gray-500 font-body text-sm uppercase tracking-[0.1em]">Manage Your Inventory</p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="h-11 bg-gray-900 hover:bg-gray-800 text-white border border-primary/50 hover:border-primary font-bold rounded-2xl px-6 text-xs uppercase tracking-widest shadow-sm hover:shadow-md transition-all"
                >
                    <Plus className="w-4 h-4 mr-2 text-primary" /> Add Product
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : products.length === 0 ? (
                <Card className="bg-white border-gray-200 rounded-[2.5rem] p-12 text-center shadow-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                            <Box className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">No products found</h3>
                            <p className="text-gray-500 mt-2">Get started by adding your first product.</p>
                        </div>
                        <Button onClick={handleCreate} variant="outline" className="mt-4 border-gray-200 text-gray-600 hover:bg-gray-50">
                            Create Product
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {/* Desktop Table */}
                    <Card className="hidden md:block bg-white border-gray-200 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="px-8 pt-8 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1.5">
                                    <CardTitle className="font-heading text-xl text-gray-900">All Products</CardTitle>
                                    <CardDescription className="text-gray-500 text-xs uppercase tracking-widest font-bold">
                                        {products.length} Total Products
                                    </CardDescription>
                                </div>
                                {totalPages > 1 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400 font-medium">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 border-gray-200"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 border-gray-200"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <Table>
                                <TableHeader className="bg-gray-50/50 border-b border-gray-200">
                                    <TableRow className="hover:bg-transparent border-gray-200">
                                        <TableHead className="w-[80px] py-5 pl-8 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Image</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Name</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">SKU</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Category</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Price</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Stock</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Status</TableHead>
                                        <TableHead className="text-right py-5 pr-8 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedProducts.map((product) => (
                                        <TableRow key={product.id} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors group">
                                            <TableCell className="py-4 pl-8">
                                                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden relative">
                                                    {product.images && product.images.length > 0 ? (
                                                        <Image
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <ImageIcon className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 font-medium text-gray-900">
                                                <div className="flex flex-col">
                                                    <span>{product.name}</span>
                                                    {product.is_featured && <span className="text-[10px] text-primary uppercase tracking-wider font-bold">Featured</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 text-gray-500 text-sm font-mono">{product.sku}</TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="outline" className="border-gray-200 text-gray-500">
                                                    {product.category?.name || 'Uncategorized'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 text-gray-900 font-medium">
                                                ${product.price.toFixed(2)}
                                                {product.sale_price && (
                                                    <span className="ml-2 text-xs text-gray-400 line-through">${product.sale_price.toFixed(2)}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-4 text-gray-500">{product.stock}</TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="secondary" className={
                                                    product.status === 'active' ? "bg-green-100 text-green-700 hover:bg-green-200" :
                                                        product.status === 'draft' ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" :
                                                            "bg-red-100 text-red-700 hover:bg-red-200"
                                                }>
                                                    {product.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right py-4 pr-8">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100" onClick={() => handleView(product)}>
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100" onClick={() => handleEdit(product)}>
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(product.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Bottom Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-8 py-4 border-t border-gray-200 bg-gray-50/30">
                                    <p className="text-xs text-gray-400">
                                        Showing {((currentPage - 1) * PRODUCTS_PER_PAGE) + 1}–{Math.min(currentPage * PRODUCTS_PER_PAGE, products.length)} of {products.length}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-medium transition-all ${currentPage === page
                                                        ? 'bg-gray-900 text-white shadow-sm'
                                                        : 'text-gray-500 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Mobile Cards */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {paginatedProducts.map((product) => (
                            <Card key={product.id} className="bg-white border-gray-200 overflow-hidden shadow-sm">
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden relative flex-shrink-0">
                                            {product.images && product.images.length > 0 ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <ImageIcon className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-gray-900 font-medium truncate">{product.name}</h4>
                                                    <p className="text-gray-500 text-xs font-mono mt-0.5">{product.sku}</p>
                                                </div>
                                                <Badge variant="secondary" className={
                                                    product.status === 'active' ? "bg-green-100 text-green-700" :
                                                        product.status === 'draft' ? "bg-yellow-100 text-yellow-700" :
                                                            "bg-red-100 text-red-700"
                                                }>
                                                    {product.status}
                                                </Badge>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-gray-900 font-medium">${product.price.toFixed(2)}</span>
                                                    {product.sale_price && (
                                                        <span className="text-xs text-gray-400 line-through">${product.sale_price.toFixed(2)}</span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-500">{product.stock} in stock</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                        <Badge variant="outline" className="border-gray-200 text-gray-500">
                                            <Tag className="w-3 h-3 mr-1" />
                                            {product.category?.name || 'Uncategorized'}
                                        </Badge>

                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100" onClick={() => handleView(product)}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100" onClick={() => handleEdit(product)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 text-gray-400 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(product.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Mobile Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 py-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-200"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                                </Button>
                                <span className="text-xs text-gray-500 px-2">
                                    {currentPage} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-200"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <ProductForm
                key={editingProduct?.id || 'create'}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                initialData={editingProduct}
                categories={categories}
                onSubmit={handleSubmit}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="bg-white border-gray-200 shadow-xl rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-gray-900 font-heading text-xl">Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500 font-body">
                            Are you sure you want to delete this product? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 hover:border-gray-400 font-bold shadow-sm hover:shadow-md transition-all">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90 transition-colors">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={!!viewProduct} onOpenChange={(open) => !open && setViewProduct(null)}>
                <DialogContent className="bg-white border-gray-200 shadow-2xl rounded-2xl sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 font-heading text-2xl">Product Details</DialogTitle>
                        <DialogDescription className="text-gray-500">
                            View product information
                        </DialogDescription>
                    </DialogHeader>
                    {viewProduct && (
                        <div className="space-y-6 pt-4">
                            {/* Images Carousel or Display */}
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                {viewProduct.images && viewProduct.images.length > 0 ? (
                                    viewProduct.images.map((img, i) => (
                                        <div key={i} className="relative w-40 h-40 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 flex-shrink-0">
                                            <Image src={img} alt={`Product ${i}`} fill className="object-cover" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="w-full h-40 flex items-center justify-center text-gray-300 bg-gray-50 rounded-xl">
                                        <ImageIcon className="w-12 h-12" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-gray-900 text-lg font-bold">{viewProduct.name}</h3>
                                    <p className="text-gray-500 text-sm">{viewProduct.sku}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">Price</p>
                                        <p className="text-gray-900 font-medium">${viewProduct.price.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">Stock</p>
                                        <p className="text-gray-900 font-medium">{viewProduct.stock}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">Category</p>
                                        <p className="text-gray-900 font-medium">{viewProduct.category?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">Status</p>
                                        <Badge variant="secondary" className="mt-1 bg-gray-100 text-gray-600">{viewProduct.status}</Badge>
                                    </div>
                                </div>

                                {viewProduct.description && (
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">Description</p>
                                        <p className="text-gray-600 text-sm leading-relaxed max-h-32 overflow-y-auto">{viewProduct.description}</p>
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
