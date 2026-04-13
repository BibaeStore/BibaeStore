'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, FolderTree, ImageIcon, Loader2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Category } from '@/types/category'
import { CategoryFormValues } from '@/lib/validations/category'
import { CategoryForm } from './CategoryForm'
import { getCategoriesAction, createCategoryAction, updateCategoryAction, deleteCategoryAction, uploadCategoryImageAction } from './actions'
import { toast } from 'sonner'
import Image from 'next/image'
import { useIsDesktop } from '@/hooks/use-media-query'
import { compressImage } from '@/lib/image-compression'
import { createClient } from '@/lib/supabase/client'
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

export default function CategoriesPage() {
    const isDesktop = useIsDesktop()
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [viewCategory, setViewCategory] = useState<Category | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const fetchCategories = async () => {
        try {
            setIsLoading(true)
            const supabase = createClient()
            const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true })
            if (error) throw new Error(error.message)
            setCategories(data as Category[])
        } catch (error: any) {
            console.error(error)
            toast.error(error?.message || "Failed to load categories")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleCreate = () => {
        setEditingCategory(null)
        setIsModalOpen(true)
    }

    const handleEdit = (category: Category) => {
        setEditingCategory(category)
        setIsModalOpen(true)
    }

    const handleView = (category: Category) => {
        setViewCategory(category)
    }

    const handleDelete = (id: string) => {
        setDeleteId(id)
    }

    const confirmDelete = async () => {
        if (!deleteId) return

        try {
            const result = await deleteCategoryAction(deleteId)
            if (result.error) throw new Error(result.error)
            toast.success("Category deleted successfully")
            fetchCategories()
        } catch (error: any) {
            console.error(error)
            toast.error(error?.message || "Failed to delete category")
        } finally {
            setDeleteId(null)
        }
    }

    const handleSubmit = async (data: CategoryFormValues, file: File | null) => {
        try {
            let imageUrl = data.image_url || null

            // Compress & upload image via server action if a file was provided
            if (file) {
                const compressed = await compressImage(file)
                const fd = new FormData()
                fd.append('file', compressed)
                const uploadResult = await uploadCategoryImageAction(fd)
                if (uploadResult.error) throw new Error(uploadResult.error)
                imageUrl = uploadResult.url!
            }

            const categoryData = {
                name: data.name,
                parent_id: data.parent_id || null,
                image_url: imageUrl,
                status: data.status,
                sort_order: data.sort_order
            }

            if (editingCategory) {
                const result = await updateCategoryAction(editingCategory.id, categoryData)
                if (result.error) throw new Error(result.error)
                toast.success("Category updated successfully")
            } else {
                const result = await createCategoryAction(categoryData)
                if (result.error) throw new Error(result.error)
                toast.success("Category created successfully")
            }
            fetchCategories()
            setIsModalOpen(false)
        } catch (error: any) {
            console.error(error)
            toast.error(error?.message || (editingCategory ? "Failed to update category" : "Failed to create category"))
            throw error
        }
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-heading font-bold text-gray-900 tracking-tight">Categories</h1>
                    <p className="text-gray-500 font-body text-sm uppercase tracking-[0.1em]">Manage Store Hierarchy</p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="h-11 bg-gray-900 hover:bg-gray-800 text-white border border-primary/50 hover:border-primary font-bold rounded-2xl px-6 text-xs uppercase tracking-widest shadow-sm hover:shadow-md transition-all"
                >
                    <Plus className="w-4 h-4 mr-2 text-primary" /> Add Category
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : categories.length === 0 ? (
                <Card className="bg-white border-gray-200 rounded-[2.5rem] p-12 text-center shadow-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                            <FolderTree className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">No categories found</h3>
                            <p className="text-gray-500 mt-2">Get started by creating your first category.</p>
                        </div>
                        <Button onClick={handleCreate} variant="outline" className="mt-4 border-gray-200 text-gray-600 hover:bg-gray-50">
                            Create Category
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {/* Desktop View - Table — only rendered on md+ screens */}
                    {isDesktop !== false && <Card className="bg-white border-gray-200 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="px-8 pt-8 pb-4">
                            <div className="space-y-1.5">
                                <CardTitle className="font-heading text-xl text-gray-900">All Categories</CardTitle>
                                <CardDescription className="text-gray-500 text-xs uppercase tracking-widest font-bold">
                                    {categories.length} Total Categories
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <Table>
                                <TableHeader className="bg-gray-50/50 border-b border-gray-200">
                                    <TableRow className="hover:bg-transparent border-gray-200">
                                        <TableHead className="w-[100px] py-5 pl-8 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Image</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Name</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Type</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Status</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Order</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Parent</TableHead>
                                        <TableHead className="text-right py-5 pr-8 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.map((category) => {
                                        const parent = categories.find(c => c.id === category.parent_id)
                                        return (
                                            <TableRow key={category.id} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors group">
                                                <TableCell className="py-4 pl-8">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden relative">
                                                        {category.image_url ? (
                                                            <Image
                                                                src={category.image_url}
                                                                alt={category.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                <ImageIcon className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 font-medium text-gray-900">
                                                    {category.name}
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <Badge variant="secondary" className={!category.parent_id ? "bg-primary/10 text-primary hover:bg-primary/20" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}>
                                                        {!category.parent_id ? "Main Category" : "Subcategory"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <Badge variant="secondary" className={category.status === 'active' ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}>
                                                        {category.status || 'Active'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-4 text-gray-500 text-sm">
                                                    {category.sort_order || 0}
                                                </TableCell>
                                                <TableCell className="py-4 text-gray-500 text-sm">
                                                    {parent ? parent.name : "-"}
                                                </TableCell>
                                                <TableCell className="text-right py-4 pr-8">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                                                            onClick={() => handleView(category)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                                                            onClick={() => handleEdit(category)}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => handleDelete(category.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>}

                    {/* Mobile View - Cards — only rendered on small screens */}
                    {isDesktop === false && <div className="grid grid-cols-1 gap-4">
                        {categories.map((category) => {
                            const parent = categories.find(c => c.id === category.parent_id)
                            return (
                                <Card key={category.id} className="bg-white border-gray-200 overflow-hidden shadow-sm">
                                    <CardContent className="p-4 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden relative flex-shrink-0">
                                                {category.image_url ? (
                                                    <Image
                                                        src={category.image_url}
                                                        alt={category.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <ImageIcon className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-gray-900 font-medium truncate">{category.name}</h4>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <Badge variant="secondary" className={!category.parent_id ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-600"}>
                                                        {!category.parent_id ? "Main" : "Sub"}
                                                    </Badge>
                                                    <Badge variant="secondary" className={category.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                                                        {category.status || 'Active'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-200 pt-4">
                                            <div>
                                                <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">Order</p>
                                                <p className="text-gray-600">{category.sort_order || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">Parent</p>
                                                <p className="text-gray-600 truncate">{parent ? parent.name : "-"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                                                onClick={() => handleView(category)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                                                onClick={() => handleEdit(category)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 text-gray-400 hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(category.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>}
                </div>
            )}

            <CategoryForm
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                initialData={editingCategory}
                categories={categories}
                onSubmit={handleSubmit}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="bg-white border-gray-200 shadow-xl rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-gray-900 font-heading text-xl">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500 font-body">
                            This action cannot be undone. This will permanently delete the category and remove its data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 hover:border-gray-400 font-bold shadow-sm hover:shadow-md transition-all">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90 transition-colors">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={!!viewCategory} onOpenChange={(open) => !open && setViewCategory(null)}>
                <DialogContent className="bg-white border-gray-200 shadow-2xl rounded-2xl sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 font-heading text-2xl">Category Details</DialogTitle>
                        <DialogDescription className="text-gray-500">
                            View complete category information
                        </DialogDescription>
                    </DialogHeader>
                    {viewCategory && (
                        <div className="space-y-6 pt-4">
                            <div className="flex justify-center">
                                <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 shadow-lg">
                                    {viewCategory.image_url ? (
                                        <Image
                                            src={viewCategory.image_url}
                                            alt={viewCategory.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <ImageIcon className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">Category Name</label>
                                    <p className="text-gray-900 text-lg font-medium">{viewCategory.name}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">Type</label>
                                        <div className="pt-1">
                                            <Badge variant="secondary" className={!viewCategory.parent_id ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-600"}>
                                                {!viewCategory.parent_id ? "Main Category" : "Subcategory"}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">Status</label>
                                        <div className="pt-1">
                                            <Badge variant="secondary" className={viewCategory.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                                                {viewCategory.status || 'Active'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">Sort Order</label>
                                        <p className="text-gray-900 font-medium pt-1">{viewCategory.sort_order || 0}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">Parent</label>
                                        <p className="text-gray-900 font-medium pt-1">
                                            {categories.find(c => c.id === viewCategory.parent_id)?.name || "-"}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1 pt-2 border-t border-gray-200">
                                    <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">Category ID</label>
                                    <p className="text-gray-400 text-xs font-mono">{viewCategory.id}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
