'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { updateOrderAction } from './actions'
import { Order } from '@/types/client'

const orderSchema = z.object({
    guest_name: z.string().optional().nullable(),
    guest_email: z.string().email("Invalid email").optional().nullable().or(z.literal('')),
    guest_phone: z.string().optional().nullable(),
    shipping_address: z.string().min(5, "Address must be at least 5 characters"),
    tracking_number: z.string().optional().nullable(),
    admin_notes: z.string().optional().nullable(),
})

type OrderFormValues = z.infer<typeof orderSchema>

interface OrderEditFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    order: Order | null
    onSuccess: (updatedOrder: Order) => void
}

export function OrderEditForm({ open, onOpenChange, order, onSuccess }: OrderEditFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<OrderFormValues>({
        resolver: zodResolver(orderSchema),
        values: {
            guest_name: order?.guest_name || '',
            guest_email: order?.guest_email || '',
            guest_phone: order?.guest_phone || '',
            shipping_address: order?.shipping_address || '',
            tracking_number: order?.tracking_number || '',
            admin_notes: order?.admin_notes || '',
        },
    })

    const onSubmit = async (values: OrderFormValues) => {
        if (!order) return

        try {
            setIsSubmitting(true)

            // Clean values
            const updateData: any = {
                shipping_address: values.shipping_address,
                tracking_number: values.tracking_number || null,
                admin_notes: values.admin_notes || null,
            }

            // Only update guest fields if it was a guest order
            if (!order.client_id) {
                updateData.guest_name = values.guest_name || null
                updateData.guest_email = values.guest_email || null
                updateData.guest_phone = values.guest_phone || null
            }

            const result = await updateOrderAction(order.id, updateData)

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success("Order updated successfully")
            onSuccess(result.data as Order)
            onOpenChange(false)
        } catch (error) {
            console.error('Update error:', error)
            toast.error("Failed to update order")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white border-gray-200">
                <DialogHeader>
                    <DialogTitle>Edit Order Details</DialogTitle>
                    <DialogDescription>
                        Update customer information and order specifics.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        {!order?.client_id && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="guest_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Customer Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="guest_phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="guest_email"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} type="email" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="shipping_address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Shipping Address</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} value={field.value || ''} className="min-h-[80px]" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tracking_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tracking Number</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || ''} placeholder="e.g. TRK12345678" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="admin_notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Admin Notes</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} value={field.value || ''} placeholder="Internal notes (not visible to customer)" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
