'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, FolderTree, ImageIcon, Loader2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CategoryService } from '@/services/category.service'
import { Category, CategoryFormData } from '@/types/category'
import { CategoryFormValues } from '@/lib/validations/category'
import { CategoryForm } from './CategoryForm'
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

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [viewCategory, setViewCategory] = useState<Category | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const fetchCategories = async () => {
        try {
            setIsLoading(true)
            const data = await CategoryService.getCategories()
            setCategories(data)
        } catch (error) {
            console.error(error)
            // toast.error("Failed to load categories") // Suppress error on initial load if table is missing
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
            await CategoryService.deleteCategory(deleteId)
            toast.success("Category deleted successfully")
            fetchCategories()
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete category")
        } finally {
            setDeleteId(null)
        }
    }

    const handleSubmit = async (data: CategoryFormValues, file: File | null) => {
        try {
            const formData: CategoryFormData = {
                name: data.name,
                parent_id: data.parent_id || null,
                image_url: data.image_url || null,
                imageFile: file,
                status: data.status,
                sort_order: data.sort_order
            }

            if (editingCategory) {
                await CategoryService.updateCategory(editingCategory.id, formData)
                toast.success("Category updated successfully")
            } else {
                await CategoryService.createCategory(formData)
                toast.success("Category created successfully")
            }
            fetchCategories()
            setIsModalOpen(false)
        } catch (error: any) {
            console.error(error)
            if (error.code === 'PGRST205') {
                toast.error("Database table missing. Please look at the instructions provided to the assistant.")
            } else {
                toast.error(editingCategory ? "Failed to update category" : "Failed to create category")
            }
            throw error
        }
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Categories</h1>
                    <p className="text-white/40 font-body text-sm uppercase tracking-[0.1em]">Manage Store Hierarchy</p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl px-6 text-xs uppercase tracking-widest shadow-xl shadow-primary/10 transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Category
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : categories.length === 0 ? (
                <Card className="bg-white/[0.02] border-white/5 rounded-[2.5rem] p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <FolderTree className="w-8 h-8 text-white/20" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">No categories found</h3>
                            <p className="text-white/40 mt-2">Get started by creating your first category.</p>
                        </div>
                        <Button onClick={handleCreate} variant="outline" className="mt-4 border-white/10 text-white hover:bg-white/5">
                            Create Category
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {/* Desktop View - Table */}
                    <Card className="hidden md:block bg-white/[0.02] border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <CardHeader className="px-8 pt-8 pb-4">
                            <div className="space-y-1.5">
                                <CardTitle className="font-heading text-xl text-white">All Categories</CardTitle>
                                <CardDescription className="text-white/30 text-xs uppercase tracking-widest font-bold">
                                    {categories.length} Total Categories
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <Table>
                                <TableHeader className="bg-white/[0.02] border-b border-white/5">
                                    <TableRow className="hover:bg-transparent border-white/5">
                                        <TableHead className="w-[100px] py-5 pl-8 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Image</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Name</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Type</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Status</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Order</TableHead>
                                        <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Parent</TableHead>
                                        <TableHead className="text-right py-5 pr-8 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.map((category) => {
                                        const parent = categories.find(c => c.id === category.parent_id)
                                        return (
                                            <TableRow key={category.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                                                <TableCell className="py-4 pl-8">
                                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden relative">
                                                        {category.image_url ? (
                                                            <Image
                                                                src={category.image_url}
                                                                alt={category.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-white/20">
                                                                <ImageIcon className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 font-medium text-white/90">
                                                    {category.name}
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <Badge variant="secondary" className={!category.parent_id ? "bg-primary/10 text-primary hover:bg-primary/20" : "bg-white/5 text-white/60 hover:bg-white/10"}>
                                                        {!category.parent_id ? "Main Category" : "Subcategory"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <Badge variant="secondary" className={category.status === 'active' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}>
                                                        {category.status || 'Active'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-4 text-white/50 text-sm">
                                                    {category.sort_order || 0}
                                                </TableCell>
                                                <TableCell className="py-4 text-white/50 text-sm">
                                                    {parent ? parent.name : "-"}
                                                </TableCell>
                                                <TableCell className="text-right py-4 pr-8">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10"
                                                            onClick={() => handleView(category)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10"
                                                            onClick={() => handleEdit(category)}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-white/40 hover:text-destructive hover:bg-destructive/10"
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
                    </Card>
                </div>
            )}

            {/* Mobile View - Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {categories.map((category) => {
                    const parent = categories.find(c => c.id === category.parent_id)
                    return (
                        <Card key={category.id} className="bg-white/[0.02] border-white/5 overflow-hidden">
                            <CardContent className="p-4 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 overflow-hidden relative flex-shrink-0">
                                        {category.image_url ? (
                                            <Image
                                                src={category.image_url}
                                                alt={category.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/20">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-medium truncate">{category.name}</h4>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <Badge variant="secondary" className={!category.parent_id ? "bg-primary/10 text-primary" : "bg-white/5 text-white/60"}>
                                                {!category.parent_id ? "Main" : "Sub"}
                                            </Badge>
                                            <Badge variant="secondary" className={category.status === 'active' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}>
                                                {category.status || 'Active'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm border-t border-white/5 pt-4">
                                    <div>
                                        <p className="text-white/40 text-xs uppercase tracking-wider font-bold mb-1">Order</p>
                                        <p className="text-white/80">{category.sort_order || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-xs uppercase tracking-wider font-bold mb-1">Parent</p>
                                        <p className="text-white/80 truncate">{parent ? parent.name : "-"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 border-t border-white/5 pt-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10"
                                        onClick={() => handleView(category)}
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10"
                                        onClick={() => handleEdit(category)}
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 text-white/40 hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(category.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <CategoryForm
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                initialData={editingCategory}
                categories={categories}
                onSubmit={handleSubmit}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="bg-zinc-950 border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white font-heading text-xl">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60 font-body">
                            This action cannot be undone. This will permanently delete the category and remove its data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white transition-colors">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90 transition-colors">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={!!viewCategory} onOpenChange={(open) => !open && setViewCategory(null)}>
                <DialogContent className="bg-zinc-950 border-white/10 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white font-heading text-2xl">Category Details</DialogTitle>
                        <DialogDescription className="text-white/40">
                            View complete category information
                        </DialogDescription>
                    </DialogHeader>
                    {viewCategory && (
                        <div className="space-y-6 pt-4">
                            <div className="flex justify-center">
                                <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl">
                                    {viewCategory.image_url ? (
                                        <Image
                                            src={viewCategory.image_url}
                                            alt={viewCategory.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/20">
                                            <ImageIcon className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-widest text-white/40 font-bold">Category Name</label>
                                    <p className="text-white text-lg font-medium">{viewCategory.name}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs uppercase tracking-widest text-white/40 font-bold">Type</label>
                                        <div className="pt-1">
                                            <Badge variant="secondary" className={!viewCategory.parent_id ? "bg-primary/10 text-primary" : "bg-white/5 text-white/60"}>
                                                {!viewCategory.parent_id ? "Main Category" : "Subcategory"}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs uppercase tracking-widest text-white/40 font-bold">Status</label>
                                        <div className="pt-1">
                                            <Badge variant="secondary" className={viewCategory.status === 'active' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}>
                                                {viewCategory.status || 'Active'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs uppercase tracking-widest text-white/40 font-bold">Sort Order</label>
                                        <p className="text-white font-medium pt-1">{viewCategory.sort_order || 0}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs uppercase tracking-widest text-white/40 font-bold">Parent</label>
                                        <p className="text-white font-medium pt-1">
                                            {categories.find(c => c.id === viewCategory.parent_id)?.name || "-"}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1 pt-2 border-t border-white/5">
                                    <label className="text-xs uppercase tracking-widest text-white/40 font-bold">Category ID</label>
                                    <p className="text-white/30 text-xs font-mono">{viewCategory.id}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
