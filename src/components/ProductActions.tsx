'use client'

import React, { useState } from 'react';
import { ShoppingBag, Heart, Minus, Plus, Check, Ruler } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/lib/cart';
import { toast } from 'sonner';

interface ProductActionsProps {
    product: any;
}

export default function ProductActions({ product }: ProductActionsProps) {
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [addedToCart, setAddedToCart] = useState(false);

    // Build sizes from variants (per-size stock) or fallback to defaults
    const variantSizes = product.variants?.sizes;
    const hasVariantSizes = variantSizes && Object.keys(variantSizes).length > 0;

    const allSizeData: { name: string; stock: number; enabled: boolean }[] = hasVariantSizes
        ? Object.entries(variantSizes)
            .map(([size, v]: [string, any]) => ({ name: size, stock: v.stock || 0, enabled: v.enabled || false }))
        : [];

    const sizes = hasVariantSizes
        ? allSizeData.filter(s => s.enabled).map(s => s.name)
        : (product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L']);

    const unavailableSizes = hasVariantSizes
        ? allSizeData.filter(s => s.enabled && s.stock <= 0).map(s => s.name)
        : [];

    const getSelectedSizeStock = (): number | null => {
        if (!hasVariantSizes || !selectedSize) return null;
        const sizeData = allSizeData.find(s => s.name === selectedSize);
        return sizeData ? sizeData.stock : null;
    };

    const selectedSizeStock = getSelectedSizeStock();
    const maxQuantity = selectedSizeStock !== null ? selectedSizeStock : (product.stock || 10);
    const colors = product.variants?.colors?.length ? product.variants.colors : (product.colors && product.colors.length > 0 && product.colors[0] !== 'Standard' ? product.colors : []);

    const handleAddToCart = () => {
        if (sizes.length > 0 && !selectedSize) {
            toast.error("Please select a size");
            return;
        }

        addItem({
            ...product,
            image: product.images?.[0] || '/assets/placeholder.jpg',
            price: product.sale_price || product.price,
            originalPrice: product.sale_price ? product.price : null
        }, selectedSize || "Standard", selectedColor || "Default", quantity);

        setAddedToCart(true);
        toast.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart!`);

        setTimeout(() => {
            setAddedToCart(false);
            setQuantity(1);
        }, 2000);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Size Selection */}
            {sizes.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-body font-medium tracking-wider uppercase">Size</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {sizes.map((size: string) => {
                            const isOutOfStock = unavailableSizes.includes(size);
                            return (
                                <button
                                    key={size}
                                    onClick={() => {
                                        if (!isOutOfStock) {
                                            setSelectedSize(size);
                                            setQuantity(1);
                                        }
                                    }}
                                    disabled={isOutOfStock}
                                    className={`min-w-[50px] px-4 py-2.5 text-sm font-body border transition-all duration-200 relative ${isOutOfStock
                                            ? "border-border text-muted-foreground/30 cursor-not-allowed bg-gray-50"
                                            : selectedSize === size
                                                ? "bg-foreground text-background border-foreground"
                                                : "border-border hover:border-foreground"
                                        }`}
                                >
                                    <span className={isOutOfStock ? "line-through" : ""}>{size}</span>
                                </button>
                            );
                        })}
                    </div>
                    {selectedSize && selectedSizeStock !== null && selectedSizeStock <= 5 && selectedSizeStock > 0 && (
                        <p className="text-xs text-amber-600 font-medium mt-2">🔥 Only {selectedSizeStock} left in this size!</p>
                    )}
                </div>
            )}

            {/* Color Selection */}
            {colors.length > 0 && (
                <div>
                    <p className="text-sm font-body font-medium mb-3 tracking-wider uppercase">
                        Color{selectedColor && <span className="font-normal text-muted-foreground ml-2">— {selectedColor}</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {colors.map((color: string) => (
                            <button
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                className={`px-4 py-2.5 text-sm font-body border transition-all duration-200 ${selectedColor === color ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}
                            >
                                {color}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Quantity Selection */}
            <div>
                <p className="text-sm font-body font-medium mb-3 tracking-wider uppercase">Quantity</p>
                <div className="flex items-center border border-border w-fit rounded-sm overflow-hidden">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        disabled={quantity <= 1}
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-6 text-sm font-body font-medium min-w-[60px] text-center">{quantity}</span>
                    <button
                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                        className="p-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        disabled={quantity >= maxQuantity}
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Main Actions */}
            <div className="flex flex-col gap-4">
                {product.stock > 0 && product.stock <= 5 && !selectedSize && (
                    <div className="text-red-500 text-sm font-medium animate-pulse mb-1">
                        🔥 Hurry! Only {product.stock} units left in stock.
                    </div>
                )}

                <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className={`w-full font-medium py-4 px-8 rounded-sm shadow-button transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wider text-sm ${product.stock > 0
                        ? addedToCart
                            ? "bg-green-600 text-white"
                            : "bg-primary hover:bg-gold-dark text-white hover:shadow-button-hover hover:-translate-y-0.5"
                        : "bg-gray-300 cursor-not-allowed text-gray-500"
                        }`}
                >
                    {addedToCart ? (
                        <><Check className="w-5 h-5" /> Added!</>
                    ) : (
                        <><ShoppingBag className="w-5 h-5" /> {product.stock > 0 ? "Add to Cart" : "Out of Stock"}</>
                    )}
                </button>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        className="border border-gray-200 hover:border-gray-900 text-gray-900 py-3 rounded-sm transition-colors text-sm font-medium"
                        onClick={() => {
                            if (sizes.length > 0 && !selectedSize) {
                                toast.error("Please select a size");
                                return;
                            }
                            handleAddToCart();
                            // Logic for direct checkout could go here
                        }}
                    >
                        Buy Now
                    </button>
                    <button className="border border-gray-200 hover:border-red-500 text-gray-500 hover:text-red-500 py-3 rounded-sm transition-colors text-sm flex items-center justify-center gap-2">
                        <Heart className="w-4 h-4" /> Add to Wishlist
                    </button>
                </div>
            </div>
        </div>
    );
}
