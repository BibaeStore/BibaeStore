"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Upload, X, Plus, Trash2 } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Product } from "@/types/product"
import { ALL_SIZES, ADULT_SIZES, KIDS_SIZES, ProductVariants } from "@/types/product"
import { Category } from "@/types/category"
import { productSchema, ProductFormValues } from "@/lib/validations/product"

interface ProductFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: Product | null
    categories: Category[]
    onSubmit: (data: ProductFormValues, files: File[], existingImages: string[]) => Promise<void>
}

export function ProductForm({
    open,
    onOpenChange,
    initialData,
    categories,
    onSubmit,
}: ProductFormProps) {
    const [files, setFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || [])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [sizeType, setSizeType] = useState<"adult" | "kids">("adult")
    const [sizeStocks, setSizeStocks] = useState<Record<string, { stock: number; enabled: boolean }>>(() => {
        const initial: Record<string, { stock: number; enabled: boolean }> = {}
        ALL_SIZES.forEach(size => {
            const sizeData = initialData?.variants?.sizes?.[size]
            initial[size] = {
                stock: sizeData?.stock || 0,
                enabled: sizeData?.enabled || false
            }
        })
        return initial
    })

    // Detect initial size type
    useEffect(() => {
        if (initialData?.variants?.sizes) {
            const hasKidsSizes = KIDS_SIZES.some(size => initialData.variants?.sizes?.[size]?.enabled)
            if (hasKidsSizes) setSizeType("kids")
            else setSizeType("adult")
        } else {
            // Default based on category, but for now default to what is selected
        }
    }, [initialData])

    // Size guide state — initialize from initialData if editing
    const [sizeGuideEnabled, setSizeGuideEnabled] = useState(!!initialData?.size_guide?.headers?.length)
    const [sizeGuideHeaders, setSizeGuideHeaders] = useState<string[]>(
        initialData?.size_guide?.headers || ["Size", "Chest (in)", "Waist (in)", "Length (in)"]
    )
    const [sizeGuideRows, setSizeGuideRows] = useState<string[][]>(
        initialData?.size_guide?.rows || [["S", "", "", ""], ["M", "", "", ""], ["L", "", "", ""]]
    )

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: initialData ? {
            name: initialData.name,
            sku: initialData.sku,
            category_id: initialData.category_id || "null",
            short_description: initialData.short_description || "",
            description: initialData.description || "",
            price: initialData.price,
            sale_price: initialData.sale_price || null,
            stock: initialData.stock,
            status: initialData.status || "draft",
            is_featured: initialData.is_featured || false,
            slug: initialData.slug || "",
            meta_title: initialData.meta_title || "",
            meta_description: initialData.meta_description || "",
            keywords: initialData.keywords?.join(", ") || "",
            variants: initialData.variants || undefined,
            size_guide: initialData.size_guide || null,
        } : {
            name: "",
            sku: "",
            category_id: "null",
            short_description: "",
            description: "",
            price: 0,
            sale_price: null,
            stock: 0,
            status: "draft",
            is_featured: false,
            slug: "",
            meta_title: "",
            meta_description: "",
            keywords: "",
            variants: undefined,
            size_guide: null,
        },
    })

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    name: initialData.name,
                    sku: initialData.sku,
                    category_id: initialData.category_id || "null",
                    short_description: initialData.short_description || "",
                    description: initialData.description || "",
                    price: initialData.price,
                    sale_price: initialData.sale_price || null,
                    stock: initialData.stock,
                    status: initialData.status || "draft",
                    is_featured: initialData.is_featured || false,
                    slug: initialData.slug || "",
                    meta_title: initialData.meta_title || "",
                    meta_description: initialData.meta_description || "",
                    keywords: initialData.keywords?.join(", ") || "",
                    variants: initialData.variants || undefined,
                    size_guide: initialData.size_guide || null,
                })
                setExistingImages(initialData.images || [])

                // Initialize size stocks from variants
                const sizes: Record<string, { stock: number; enabled: boolean }> = {}
                ALL_SIZES.forEach(size => {
                    const sizeData = initialData.variants?.sizes?.[size]
                    sizes[size] = {
                        stock: sizeData?.stock || 0,
                        enabled: sizeData?.enabled || false
                    }
                })
                setSizeStocks(sizes)

                // Initialize size guide
                if (initialData.size_guide?.headers?.length) {
                    setSizeGuideEnabled(true)
                    setSizeGuideHeaders(initialData.size_guide.headers)
                    setSizeGuideRows(initialData.size_guide.rows)
                } else {
                    setSizeGuideEnabled(false)
                    setSizeGuideHeaders(["Size", "Chest (in)", "Waist (in)", "Length (in)"])
                    setSizeGuideRows([["S", "", "", ""], ["M", "", "", ""], ["L", "", "", ""]])
                }
            } else {
                form.reset({
                    name: "",
                    sku: "",
                    category_id: "null",
                    short_description: "",
                    description: "",
                    price: 0,
                    sale_price: null,
                    stock: 0,
                    status: "draft",
                    is_featured: false,
                    slug: "",
                    meta_title: "",
                    meta_description: "",
                    keywords: "",
                    variants: undefined,
                    size_guide: null,
                })
                setExistingImages([])
                const initial: Record<string, { stock: number; enabled: boolean }> = {}
                ALL_SIZES.forEach(size => {
                    initial[size] = { stock: 0, enabled: false }
                })
                setSizeStocks(initial)
                setSizeGuideEnabled(false)
                setSizeGuideHeaders(["Size", "Chest (in)", "Waist (in)", "Length (in)"])
                setSizeGuideRows([["S", "", "", ""], ["M", "", "", ""], ["L", "", "", ""]])
            }
            setFiles([])
            setPreviews([])
        }
    }, [open, initialData, form])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || [])
        if (selectedFiles.length > 0) {
            setFiles((prev) => [...prev, ...selectedFiles])
            const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file))
            setPreviews((prev) => [...prev, ...newPreviews])
        }
    }

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
        setPreviews((prev) => prev.filter((_, i) => i !== index))
    }

    const removeExistingImage = (index: number) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSizeToggle = (size: string, enabled: boolean) => {
        setSizeStocks(prev => ({
            ...prev,
            [size]: { ...prev[size], enabled, stock: enabled ? prev[size].stock : 0 }
        }))
    }

    const handleSizeStockChange = (size: string, stock: number) => {
        setSizeStocks(prev => ({
            ...prev,
            [size]: { ...prev[size], stock: Math.max(0, stock) }
        }))
    }

    const handleSubmit = async (values: ProductFormValues) => {
        try {
            setIsSubmitting(true)

            // Build variants from size stocks
            const hasAnySizeEnabled = Object.values(sizeStocks).some(s => s.enabled)
            const variants: ProductVariants | undefined = hasAnySizeEnabled ? {
                sizes: sizeStocks,
                colors: values.variants?.colors || []
            } : undefined

            // Calculate total stock from enabled sizes
            const totalStock = hasAnySizeEnabled
                ? Object.values(sizeStocks).reduce((sum, s) => sum + (s.enabled ? s.stock : 0), 0)
                : values.stock

            await onSubmit({
                ...values,
                category_id: values.category_id === "null" ? null : values.category_id,
                stock: totalStock,
                variants,
                size_guide: sizeGuideEnabled ? { headers: sizeGuideHeaders, rows: sizeGuideRows } : null,
            }, files, existingImages)
            onOpenChange(false)
        } catch (error) {
            // Error toast is handled by the parent onSubmit
            console.error('ProductForm submit error:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-gray-200 text-gray-900 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 font-heading">{initialData ? "Edit Product" : "Create Product"}</DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Fill in the details to {initialData ? "update" : "add"} a product.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700">Product Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Classic T-Shirt" {...field} className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary/20" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="sku"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700">SKU</FormLabel>
                                        <FormControl>
                                            <Input placeholder="TSH-001" {...field} className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary/20" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Category & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="category_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700">Category</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value || "null"}
                                            value={field.value || "null"}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-white border-gray-200 text-gray-900 focus:ring-primary/20">
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-white border-gray-200 text-gray-900">
                                                <SelectItem value="null">Uncategorized</SelectItem>
                                                {categories
                                                    .filter((cat) => !cat.parent_id)
                                                    .sort((a, b) => a.sort_order - b.sort_order)
                                                    .map((parent) => {
                                                        const children = categories.filter((c) => c.parent_id === parent.id).sort((a, b) => a.sort_order - b.sort_order)
                                                        return [
                                                            <SelectItem key={parent.id} value={parent.id} className="font-semibold">
                                                                {parent.name}
                                                            </SelectItem>,
                                                            ...children.map((child) => (
                                                                <SelectItem key={child.id} value={child.id} className="pl-8">
                                                                    ↳ {child.name}
                                                                </SelectItem>
                                                            ))
                                                        ]
                                                    })}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700">Status</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-white border-gray-200 text-gray-900 focus:ring-primary/20">
                                                    <SelectValue placeholder="Select Status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-white border-gray-200 text-gray-900">
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Images */}
                        <div className="space-y-4">
                            <FormLabel className="text-gray-700">Product Images</FormLabel>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                <div className="relative aspect-square border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer overflow-hidden group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={handleFileChange}
                                    />
                                    <Upload className="h-6 w-6 text-gray-400 group-hover:text-primary mb-2 transition-colors" />
                                    <span className="text-xs text-gray-500 text-center px-2 group-hover:text-gray-700">Add Images</span>
                                </div>

                                {existingImages.map((src, index) => (
                                    <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white group shadow-sm">
                                        <Image src={src} alt={`Existing ${index}`} fill className="object-cover" />
                                        <div className="absolute top-1 right-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                            <Button type="button" variant="destructive" size="icon" className="h-6 w-6 rounded-full shadow-md bg-white hover:bg-red-50 text-red-500 border border-gray-200" onClick={() => removeExistingImage(index)}>
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {previews.map((src, index) => (
                                    <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white group shadow-sm">
                                        <Image src={src} alt={`Preview ${index}`} fill className="object-cover" />
                                        <div className="absolute top-1 right-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                            <Button type="button" variant="destructive" size="icon" className="h-6 w-6 rounded-full shadow-md bg-white hover:bg-red-50 text-red-500 border border-gray-200" onClick={() => removeFile(index)}>
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700">Price (Rs.)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary/20" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="sale_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700">Sale Price (Optional)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" value={field.value || ""} onChange={field.onChange} className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary/20" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Sizes & Stock Management */}
                        <div className="space-y-4 border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                            <div>
                                <FormLabel className="text-gray-700 text-base font-semibold">Sizes & Stock</FormLabel>
                                <FormDescription className="text-gray-500 text-xs mt-1">
                                    Enable sizes and set stock per size. Total stock is auto-calculated.
                                </FormDescription>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <FormLabel className="text-gray-700 text-sm font-semibold">Size Type:</FormLabel>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={sizeType === 'adult' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSizeType('adult')}
                                        className={sizeType === 'adult' ? 'bg-primary text-primary-foreground' : ''}
                                    >
                                        Adult Sizes
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={sizeType === 'kids' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSizeType('kids')}
                                        className={sizeType === 'kids' ? 'bg-primary text-primary-foreground' : ''}
                                    >
                                        Kids / Baby Sizes
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {(sizeType === 'adult' ? ADULT_SIZES : KIDS_SIZES).map((size) => (
                                    <div key={size} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${sizeStocks[size]?.enabled ? 'bg-white border-primary/30 shadow-sm' : 'bg-gray-50 border-gray-200'}`}>
                                        <Checkbox
                                            checked={sizeStocks[size]?.enabled || false}
                                            onCheckedChange={(checked) => handleSizeToggle(size, !!checked)}
                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-gray-400"
                                        />
                                        <span className={`text-sm font-bold min-w-[30px] ${sizeStocks[size]?.enabled ? 'text-gray-900' : 'text-gray-400'}`}>{size}</span>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={sizeStocks[size]?.stock || 0}
                                            onChange={(e) => handleSizeStockChange(size, parseInt(e.target.value) || 0)}
                                            disabled={!sizeStocks[size]?.enabled}
                                            className="h-8 w-20 text-center text-sm bg-white border-gray-200 disabled:opacity-40"
                                            placeholder="Stock"
                                        />
                                    </div>
                                ))}
                            </div>

                            {Object.values(sizeStocks).some(s => s.enabled) && (
                                <div className="flex items-center gap-2 text-xs text-primary font-medium bg-primary/5 p-2 rounded-lg">
                                    <span>Total Stock: {Object.values(sizeStocks).reduce((sum, s) => sum + (s.enabled ? s.stock : 0), 0)}</span>
                                </div>
                            )}

                            {!Object.values(sizeStocks).some(s => s.enabled) && (
                                <FormField
                                    control={form.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 text-xs">Global Stock (no sizes enabled)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="bg-white border-gray-200 text-gray-900 focus-visible:ring-primary/20 h-9" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        {/* Size Guide */}
                        <div className="space-y-4 border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <FormLabel className="text-gray-700 text-base font-semibold">Size Guide</FormLabel>
                                    <p className="text-gray-500 text-xs mt-1">
                                        Add a measurement table customers can view on the product page.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={sizeGuideEnabled}
                                        onCheckedChange={(checked) => setSizeGuideEnabled(!!checked)}
                                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-gray-400"
                                    />
                                    <span className="text-sm text-gray-600">Include Size Guide</span>
                                </div>
                            </div>

                            {sizeGuideEnabled && (
                                <div className="space-y-4">
                                    {/* Column Headers */}
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Columns</p>
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {sizeGuideHeaders.map((header, i) => (
                                                <div key={i} className="flex items-center gap-1">
                                                    <Input
                                                        value={header}
                                                        onChange={(e) => {
                                                            const newHeaders = [...sizeGuideHeaders]
                                                            newHeaders[i] = e.target.value
                                                            setSizeGuideHeaders(newHeaders)
                                                        }}
                                                        className="h-8 w-32 text-sm bg-white border-gray-200 text-gray-900 focus-visible:ring-primary/20"
                                                        placeholder="Column name"
                                                    />
                                                    {sizeGuideHeaders.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newHeaders = sizeGuideHeaders.filter((_, idx) => idx !== i)
                                                                setSizeGuideHeaders(newHeaders)
                                                                setSizeGuideRows(sizeGuideRows.map(row => row.filter((_, idx) => idx !== i)))
                                                            }}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSizeGuideHeaders([...sizeGuideHeaders, ""])
                                                    setSizeGuideRows(sizeGuideRows.map(row => [...row, ""]))
                                                }}
                                                className="h-8 w-8 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-gray-400 hover:text-primary hover:border-primary transition-colors"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Rows */}
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Measurements</p>
                                        <div className="space-y-2">
                                            {sizeGuideRows.map((row, rowIdx) => (
                                                <div key={rowIdx} className="flex items-center gap-2">
                                                    {row.map((cell, cellIdx) => (
                                                        <Input
                                                            key={cellIdx}
                                                            value={cell}
                                                            onChange={(e) => {
                                                                const newRows = sizeGuideRows.map(r => [...r])
                                                                newRows[rowIdx][cellIdx] = e.target.value
                                                                setSizeGuideRows(newRows)
                                                            }}
                                                            className="h-8 w-32 text-sm bg-white border-gray-200 text-gray-900 focus-visible:ring-primary/20"
                                                            placeholder={sizeGuideHeaders[cellIdx] || ""}
                                                        />
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => setSizeGuideRows(sizeGuideRows.filter((_, idx) => idx !== rowIdx))}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-0.5 flex-shrink-0"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSizeGuideRows([...sizeGuideRows, new Array(sizeGuideHeaders.length).fill("")])}
                                            className="mt-2 text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                                        >
                                            <Plus className="h-3.5 w-3.5" /> Add Row
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="short_description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700">Short Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Brief summary..." className="h-20 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary/20" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700">Full Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Detailed product information..." className="h-32 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary/20" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Featured */}
                        <FormField
                            control={form.control}
                            name="is_featured"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-gray-200 p-4 bg-gray-50/50">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-gray-400"
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-gray-900">
                                            Featured Product
                                        </FormLabel>
                                        <FormDescription className="text-gray-500">
                                            This product will appear in featured sections.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {/* SEO Settings */}
                        <div className="space-y-4 border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                            <div>
                                <FormLabel className="text-gray-700 text-base font-semibold">SEO Configuration</FormLabel>
                                <FormDescription className="text-gray-500 text-xs mt-1">
                                    Optimize this product for search engines.
                                </FormDescription>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700">Slug (URL)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Leave empty to auto-generate from name" {...field} className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary/20" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="meta_title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700">Meta Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Browser Tab Title" {...field} className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary/20" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="meta_description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700">Meta Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Brief summary for search results..." className="h-20 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary/20" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="keywords"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700">Keywords (Comma Separated)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="baby clothes, organic, cotton..." {...field} className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary/20" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 hover:border-gray-400 font-bold shadow-sm hover:shadow-md transition-all">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-gray-900 hover:bg-gray-800 text-white border border-primary/50 hover:border-primary shadow-sm hover:shadow-md transition-all font-bold">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />}
                                {initialData ? "Save Changes" : "Create Product"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    )
}
