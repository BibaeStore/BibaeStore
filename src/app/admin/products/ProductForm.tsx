"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Upload, X, ImageIcon } from "lucide-react"
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
    const [existingImages, setExistingImages] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
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
                })
                setExistingImages(initialData.images || [])
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
                })
                setExistingImages([])
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
        // In a real app, might want to track these removals to send to backend
        setExistingImages((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (values: ProductFormValues) => {
        try {
            setIsSubmitting(true)
            await onSubmit({
                ...values,
                category_id: values.category_id === "null" ? null : values.category_id,
            }, files, existingImages)
            onOpenChange(false)
        } catch (error) {
            console.error(error)
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
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
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
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                                {/* Upload Button */}
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

                                {/* Existing Images */}
                                {existingImages.map((src, index) => (
                                    <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white group shadow-sm">
                                        <Image
                                            src={src}
                                            alt={`Existing ${index}`}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="h-6 w-6 rounded-full shadow-md"
                                                onClick={() => removeExistingImage(index)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {/* New Previews */}
                                {previews.map((src, index) => (
                                    <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white group shadow-sm">
                                        <Image
                                            src={src}
                                            alt={`Preview ${index}`}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="h-6 w-6 rounded-full shadow-md"
                                                onClick={() => removeFile(index)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pricing & Stock */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700">Price</FormLabel>
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

                            <FormField
                                control={form.control}
                                name="stock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700">Stock Quantity</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary/20" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
        </Dialog>
    )
}
