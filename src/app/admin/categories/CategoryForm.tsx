"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Upload, X } from "lucide-react"

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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Category } from "@/types/category"
import { categorySchema, CategoryFormValues } from "@/lib/validations/category"
import Image from "next/image"

interface CategoryFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: Category | null
    categories: Category[]
    onSubmit: (data: CategoryFormValues, file: File | null) => Promise<void>
}

export function CategoryForm({
    open,
    onOpenChange,
    initialData,
    categories,
    onSubmit,
}: CategoryFormProps) {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            parent_id: "null", // Use string "null" for select matching, convert later
            image_url: "",
            status: "active",
            sort_order: 0,
        },
    })

    // Reset form when initialData changes or dialog opens
    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    name: initialData.name,
                    parent_id: initialData.parent_id || "null",
                    image_url: initialData.image_url || "",
                    status: initialData.status || "active",
                    sort_order: initialData.sort_order || 0,
                })
                setPreview(initialData.image_url || null)
            } else {
                form.reset({
                    name: "",
                    parent_id: "null",
                    image_url: "",
                    status: "active",
                    sort_order: 0,
                })
                setPreview(null)
            }
            setFile(null)
        }
    }, [open, initialData, form])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            const objectUrl = URL.createObjectURL(selectedFile)
            setPreview(objectUrl)
        }
    }

    const handleSubmit = async (values: CategoryFormValues) => {
        try {
            setIsSubmitting(true)
            // Convert "null" string back to null for API
            const safeValues = {
                ...values,
                parent_id: values.parent_id === "null" ? null : values.parent_id,
            }
            await onSubmit(safeValues, file)
            onOpenChange(false)
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Filter out self and children from parent selection to avoid cycles (simple implementation: filter out self)
    const availableParents = categories.filter((cat) => cat.id !== initialData?.id)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Category" : "Create Category"}</DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? "Update category details."
                            : "Add a new category to your store."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

                        {/* Image Upload */}
                        <FormField
                            control={form.control}
                            name="image_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category Image</FormLabel>
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative w-full h-40 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 overflow-hidden group hover:border-primary/50 transition-colors">
                                            {preview ? (
                                                <>
                                                    <Image
                                                        src={preview}
                                                        alt="Preview"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <p className="text-white text-xs font-medium">Click to change</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                    <Upload className="h-8 w-8" />
                                                    <span className="text-xs">Upload Image</span>
                                                </div>
                                            )}

                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Ladies, Summer Collection" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="parent_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Parent Category (Optional)</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value || "null"}
                                        value={field.value || "null"}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a parent category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="null">None (Root Category)</SelectItem>
                                            {availableParents.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="sort_order"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sort Order</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? "Save Changes" : "Create Category"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
