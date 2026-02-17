'use client'

import { useEffect, useState } from 'react'
import {
    Users,
    Search,
    Mail,
    Phone,
    Calendar,
    MoreHorizontal,
    MailWarning,
    ExternalLink,
    Pencil,
    Trash2,
    Loader2
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ClientService } from '@/services/client.service'
import { Client as ClientType } from '@/types/client'
import { format } from 'date-fns'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { toast } from 'sonner' // Assuming sonner or similar toast lib is used, otherwise I'll use simple alert or console

export default function CustomersPage() {
    const [customers, setCustomers] = useState<ClientType[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    // Edit State
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState<ClientType | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Delete State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [customerToDelete, setCustomerToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        fetchCustomers()
    }, [])

    const fetchCustomers = async () => {
        try {
            const data = await ClientService.getAllClients()
            setCustomers(data)
        } catch (error) {
            console.error('Failed to fetch customers:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditClick = (customer: ClientType) => {
        setEditingCustomer({ ...customer }) // Create a copy
        setIsEditDialogOpen(true)
    }

    const handleDeleteClick = (customerId: string) => {
        setCustomerToDelete(customerId)
        setIsDeleteDialogOpen(true)
    }

    const handleUpdate = async () => {
        if (!editingCustomer) return;

        setIsSaving(true)
        try {
            // Only send fields that mock the partial update expectation
            await ClientService.updateProfile(editingCustomer.id, {
                full_name: editingCustomer.full_name,
                phone_number: editingCustomer.phone_number
            })

            // Update local state
            setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? editingCustomer : c))
            setIsEditDialogOpen(false)
            // toast.success('Customer updated successfully') 
        } catch (error) {
            console.error('Failed to update customer:', error)
            // toast.error('Failed to update customer')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!customerToDelete) return;

        setIsDeleting(true)
        try {
            await ClientService.deleteClient(customerToDelete)
            // Update local state
            setCustomers(prev => prev.filter(c => c.id !== customerToDelete))
            setIsDeleteDialogOpen(false)
            // toast.success('Customer deleted successfully')
        } catch (error) {
            console.error('Failed to delete customer:', error)
            // toast.error('Failed to delete customer')
        } finally {
            setIsDeleting(false)
            setCustomerToDelete(null)
        }
    }

    const filteredCustomers = customers.filter(customer =>
        customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.phone_number && customer.phone_number.includes(searchQuery))
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C5A059]"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-heading font-bold text-gray-900 tracking-tight">Customers</h1>
                    <p className="text-gray-500 font-body text-sm uppercase tracking-[0.1em]">Manage Customer Base</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search customers..."
                        className="pl-10 border-gray-200 rounded-xl focus:ring-[#C5A059] focus:border-[#C5A059]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-gray-200 rounded-[2rem] overflow-hidden shadow-sm bg-white">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-gray-100">
                            <TableHead className="w-[300px] font-semibold text-gray-900 py-5">Customer</TableHead>
                            <TableHead className="font-semibold text-gray-900">Contact</TableHead>
                            <TableHead className="font-semibold text-gray-900">Joined Date</TableHead>
                            <TableHead className="text-right font-semibold text-gray-900 px-8">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCustomers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <Users className="w-12 h-12 mb-4 opacity-20" />
                                        <p>No customers found matching your search.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <TableRow key={customer.id} className="hover:bg-gray-50/50 border-gray-100 transition-colors">
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                                <AvatarImage src={customer.profile_image_url || undefined} />
                                                <AvatarFallback className="bg-[#fcf9f2] text-[#C5A059] font-bold">
                                                    {customer.full_name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{customer.full_name}</span>
                                                <span className="text-xs text-gray-500 font-medium">ID: {customer.id.slice(0, 8)}...</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                {customer.email}
                                            </div>
                                            {customer.phone_number && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                    {customer.phone_number}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 uppercase tracking-wider font-medium">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            {customer.created_at ? format(new Date(customer.created_at), 'MMM dd, yyyy') : 'N/A'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white border hover:border-gray-200">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-xl border-gray-100 shadow-xl p-2">
                                                <DropdownMenuLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 py-1.5">Options</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    className="rounded-lg gap-2 cursor-pointer focus:bg-gray-50"
                                                    onClick={() => handleEditClick(customer)}
                                                >
                                                    <Pencil className="w-4 h-4 text-gray-500" />
                                                    Edit Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer focus:bg-gray-50">
                                                    <ExternalLink className="w-4 h-4 text-gray-400" />
                                                    View Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-gray-100 my-1" />
                                                <DropdownMenuItem
                                                    className="rounded-lg text-red-600 gap-2 cursor-pointer focus:bg-red-50 focus:text-red-700"
                                                    onClick={() => handleDeleteClick(customer.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Customer</DialogTitle>
                        <DialogDescription>
                            Make changes to the customer's profile here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    {editingCustomer && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={editingCustomer.full_name}
                                    onChange={(e) => setEditingCustomer({ ...editingCustomer, full_name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email (Read-only)</Label>
                                <Input
                                    id="email"
                                    value={editingCustomer.email}
                                    disabled
                                    className="bg-gray-50"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={editingCustomer.phone_number || ''}
                                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone_number: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdate} disabled={isSaving} className="bg-[#C5A059] hover:bg-[#b08d4b]">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the customer account
                            and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Account'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
