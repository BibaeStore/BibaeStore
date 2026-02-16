'use client';

import React from 'react';
import { toast } from 'sonner';

export function CouponCode({ code }: { code: string }) {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        toast.success("Coupon code copied!");
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
            <code className="font-mono text-lg font-bold text-primary">{code}</code>
            <button
                className="text-xs font-semibold text-gray-500 hover:text-primary uppercase"
                onClick={copyToClipboard}
            >
                Copy
            </button>
        </div>
    );
}
