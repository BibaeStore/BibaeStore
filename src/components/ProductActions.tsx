'use client'

import React, { useState } from 'react';
import { ShoppingBag, Heart, Minus, Plus, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { formatPrice } from '@/lib/products';
import { toast } from 'sonner';

interface ProductActionsProps {
    product: any;
    categorySlug?: string;
    parentCategorySlug?: string;
}

const WHATSAPP_NUMBER = '923348438007';

export default function ProductActions({ product, categorySlug, parentCategorySlug }: ProductActionsProps) {
    const router = useRouter();
    const { addItem } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [addedToCart, setAddedToCart] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isBuyingNow, setIsBuyingNow] = useState(false);

    // Determine if this is a baby product (no sizes needed)
    const isBabyCategory =
        categorySlug?.toLowerCase().includes('baby') ||
        parentCategorySlug?.toLowerCase().includes('baby') || false;

    // Build sizes from variants (per-size stock) or fallback to defaults
    const variantSizes = product.variants?.sizes;
    const hasVariantSizes = variantSizes && Object.keys(variantSizes).length > 0;

    const allSizeData: { name: string; stock: number; enabled: boolean }[] = hasVariantSizes
        ? Object.entries(variantSizes)
            .map(([size, v]: [string, any]) => ({ name: size, stock: v.stock || 0, enabled: v.enabled || false }))
        : [];

    // Hide sizes entirely for baby products
    const sizes = isBabyCategory ? [] : (
        hasVariantSizes
            ? allSizeData.filter(s => s.enabled).map(s => s.name)
            : (product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L'])
    );

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

    const cartProduct = {
        ...product,
        image: product.images?.[0] || '/assets/placeholder.jpg',
        price: product.sale_price || product.price,
        originalPrice: product.sale_price ? product.price : null
    };

    const handleAddToCart = async (): Promise<boolean> => {
        if (sizes.length > 0 && !selectedSize) {
            toast.error("Please select a size");
            return false;
        }

        setIsAddingToCart(true);
        try {
            const success = await addItem(
                cartProduct,
                selectedSize || "Standard",
                selectedColor || "Default",
                quantity
            );

            if (success) {
                setAddedToCart(true);
                toast.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart!`);

                setTimeout(() => {
                    setAddedToCart(false);
                    setQuantity(1);
                }, 2000);
                return true;
            }
            return false;
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        if (sizes.length > 0 && !selectedSize) {
            toast.error("Please select a size");
            return;
        }

        setIsBuyingNow(true);
        try {
            const success = await addItem(
                cartProduct,
                selectedSize || "Standard",
                selectedColor || "Default",
                quantity
            );

            if (success) {
                router.push('/checkout');
            }
        } finally {
            setIsBuyingNow(false);
        }
    };

    const handleWhatsApp = () => {
        const productUrl = `https://habibaminhas.com/shop/${product.slug || product.id}`;
        const price = formatPrice(product.sale_price || product.price);
        const message = `Hi Habiba Minhas! I'm interested in this product:\n\n*${product.name}*\nPrice: ${price}\n\n${productUrl}`;
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Size Selection - Hidden for Baby Products */}
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
                        <p className="text-xs text-amber-600 font-medium mt-2">Only {selectedSizeStock} left in this size!</p>
                    )}
                </div>
            )}

            {/* Color Selection */}
            {colors.length > 0 && (
                <div>
                    <p className="text-sm font-body font-medium mb-3 tracking-wider uppercase">
                        Color{selectedColor && <span className="font-normal text-muted-foreground ml-2">&mdash; {selectedColor}</span>}
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
            <div className="flex flex-col gap-3">
                {product.stock > 0 && product.stock <= 5 && !selectedSize && (
                    <div className="text-red-500 text-sm font-medium animate-pulse mb-1">
                        Hurry! Only {product.stock} units left in stock.
                    </div>
                )}

                {/* Add to Cart */}
                <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0 || isAddingToCart}
                    className={`w-full font-medium py-4 px-8 rounded-sm shadow-button transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wider text-sm ${product.stock > 0
                        ? addedToCart
                            ? "bg-green-600 text-white"
                            : isAddingToCart
                                ? "bg-gray-400 text-white cursor-wait"
                                : "bg-primary hover:bg-gold-dark text-white hover:shadow-button-hover hover:-translate-y-0.5"
                        : "bg-gray-300 cursor-not-allowed text-gray-500"
                        }`}
                >
                    {addedToCart ? (
                        <><Check className="w-5 h-5" /> Added!</>
                    ) : isAddingToCart ? (
                        "Adding..."
                    ) : (
                        <><ShoppingBag className="w-5 h-5" /> {product.stock > 0 ? "Add to Cart" : "Out of Stock"}</>
                    )}
                </button>

                {/* Buy Now */}
                <button
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0 || isBuyingNow}
                    className={`w-full font-medium py-3.5 px-8 rounded-sm transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wider text-sm border-2 ${product.stock > 0
                        ? isBuyingNow
                            ? "border-gray-300 text-gray-400 cursor-wait"
                            : "border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                        : "border-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                >
                    {isBuyingNow ? "Redirecting..." : "Buy Now"}
                </button>

                {/* WhatsApp + Wishlist Row */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleWhatsApp}
                        className="border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white py-3 rounded-sm transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                    </button>
                    <button
                        onClick={() => toggleWishlist({
                            ...product,
                            image: product.image || product.images?.[0] || '/assets/placeholder.jpg',
                            price: product.sale_price || product.price,
                            originalPrice: product.sale_price ? product.price : null,
                            category: typeof product.category === 'object' && product.category !== null ? (product.category as any).name || 'Uncategorized' : (product.category || 'Uncategorized')
                        })}
                        className={`border py-3 rounded-sm transition-colors text-sm flex items-center justify-center gap-2 ${isInWishlist(product.id)
                            ? "border-red-500 text-red-500 bg-red-50"
                            : "border-gray-200 hover:border-red-500 text-gray-400 hover:text-red-500"
                            }`}
                    >
                        <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                        {isInWishlist(product.id) ? "Wishlisted" : "Wishlist"}
                    </button>
                </div>
            </div>
        </div>
    );
}
