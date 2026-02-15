'use client'

import { Order } from '@/types/client'

interface ShippingLabelProps {
    order: Order
}

export function ShippingLabel({ order }: ShippingLabelProps) {
    const orderDate = order.created_at
        ? new Date(order.created_at)
        : new Date()

    const formattedDate = orderDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })

    const itemCount = order.items?.length ?? 0
    const totalQuantity = order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

    const paymentLabel =
        order.payment_method === 'cod' ? 'COD' : 'PAID'

    const parseAddress = (address?: string) => {
        if (!address) return { city: '-', state: '-', postalCode: '-', full: '-' }
        return { full: address }
    }

    const address = parseAddress(order.shipping_address)

    return (
        <>
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #shipping-label-${order.id},
                    #shipping-label-${order.id} * {
                        visibility: visible;
                    }
                    #shipping-label-${order.id} {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 10cm;
                        height: 15cm;
                        margin: 0;
                        padding: 6mm;
                        box-sizing: border-box;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div
                id={`shipping-label-${order.id}`}
                className="w-[10cm] min-h-[15cm] border-2 border-black bg-white text-black p-6 font-mono text-sm mx-auto"
            >
                {/* Header */}
                <div className="text-center border-b-2 border-black pb-3 mb-3">
                    <h1 className="text-2xl font-black tracking-widest">
                        BIBAE STORE
                    </h1>
                    <p className="text-xs tracking-wide mt-0.5">bibaestore.com</p>
                </div>

                {/* Tracking Number */}
                <div className="text-center border-b border-dashed border-black pb-3 mb-3">
                    <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">
                        Tracking Number
                    </p>
                    <p className="text-lg font-black tracking-wider">
                        {order.tracking_number ?? '-'}
                    </p>
                </div>

                {/* Customer Info */}
                <div className="border-b border-dashed border-black pb-3 mb-3 space-y-1.5">
                    <p className="text-[10px] uppercase tracking-widest text-gray-600">
                        Ship To
                    </p>
                    <p className="text-base font-bold leading-tight">
                        {order.client?.full_name ?? '-'}
                    </p>
                    <p className="text-xs">
                        {order.client?.phone_number ?? '-'}
                    </p>
                </div>

                {/* Shipping Address */}
                <div className="border-b border-dashed border-black pb-3 mb-3 space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-gray-600">
                        Address
                    </p>
                    <p className="text-xs leading-relaxed">{address.full}</p>
                </div>

                {/* Order Details */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-widest text-gray-600">
                            Total
                        </span>
                        <span className="text-base font-bold">
                            {order.total_amount.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}{' '}
                            PKR
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-widest text-gray-600">
                            Payment
                        </span>
                        <span
                            className={`text-xs font-bold px-2 py-0.5 border border-black ${
                                paymentLabel === 'COD'
                                    ? 'bg-black text-white'
                                    : 'bg-white text-black'
                            }`}
                        >
                            {paymentLabel}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-widest text-gray-600">
                            Date
                        </span>
                        <span className="text-xs font-semibold">
                            {formattedDate}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-widest text-gray-600">
                            Items
                        </span>
                        <span className="text-xs font-semibold">
                            {itemCount} item{itemCount !== 1 ? 's' : ''} ({totalQuantity} pcs)
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t-2 border-black text-center">
                    <p className="text-[9px] tracking-wider text-gray-500">
                        Thank you for shopping with Bibae Store
                    </p>
                </div>

                {/* Print Button */}
                <div className="no-print mt-6 text-center">
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-2 bg-black text-white text-sm font-semibold tracking-wide hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        Print Label
                    </button>
                </div>
            </div>
        </>
    )
}

export default ShippingLabel
