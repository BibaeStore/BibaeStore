'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';

const MOCK_NAMES = ['Ayesha K.', 'Fatima R.', 'Zainab A.', 'Maryam S.', 'Hina B.', 'Sana M.', 'Zara T.', 'Bushra P.', 'Nida Y.', 'Rabia H.'];
const MOCK_CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'];

export default function RecentSalesPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentSale, setCurrentSale] = useState<any>(null);
    const [isDismissed, setIsDismissed] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const pathname = usePathname();

    // Do not show popup on admin pages
    const isAdminPage = pathname?.startsWith('/admin');

    useEffect(() => {
        const fetchProducts = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from('products')
                .select('id, name, images')
                .eq('status', 'active')
                .limit(20);

            if (data && data.length > 0) {
                setProducts(data);
            }
        };

        fetchProducts();
    }, []);

    const generateRandomSale = () => {
        if (products.length === 0) return null;

        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const randomName = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
        const randomCity = MOCK_CITIES[Math.floor(Math.random() * MOCK_CITIES.length)];

        // Generate realistic "recent" time
        const timeUnits = ['minute', 'minutes', 'hour'];
        const isJustNow = Math.random() > 0.8;
        let timeString = 'Just now';

        if (!isJustNow) {
            const unit = Math.random() > 0.7 ? 'hour' : 'minute';
            const value = unit === 'hour' ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 45) + 1; // 1-5 hours or 1-45 mins

            // Fix pluralization
            const finalUnit = value === 1 ? unit : `${unit}s`;
            timeString = `${value} ${finalUnit} ago`;
        }

        return {
            name: randomName,
            city: randomCity,
            product: randomProduct.name,
            time: timeString,
            image: randomProduct.images?.[0] || '/assets/placeholder.jpg'
        };
    };

    useEffect(() => {
        if (isDismissed || products.length === 0) return;

        // Initial delay before first popup
        const initialTimeout = setTimeout(() => {
            const sale = generateRandomSale();
            if (sale) {
                setCurrentSale(sale);
                setIsVisible(true);
            }
        }, 8000);

        return () => clearTimeout(initialTimeout);
    }, [isDismissed, products]);

    useEffect(() => {
        if (isDismissed || products.length === 0) return;

        let hideTimeout: NodeJS.Timeout;
        let nextTimeout: NodeJS.Timeout;

        if (isVisible) {
            // Hide after 6 seconds
            hideTimeout = setTimeout(() => {
                setIsVisible(false);
            }, 6000);
        } else {
            // Show next one after a random delay (15-25 seconds)
            const randomDelay = Math.floor(Math.random() * 10000) + 15000;
            nextTimeout = setTimeout(() => {
                const sale = generateRandomSale();
                if (sale) {
                    setCurrentSale(sale);
                    setIsVisible(true);
                }
            }, randomDelay);
        }

        return () => {
            clearTimeout(hideTimeout);
            clearTimeout(nextTimeout);
        };
    }, [isVisible, isDismissed, products]);

    if (isDismissed || !currentSale || isAdminPage) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: -20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 20, x: -20 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="fixed bottom-4 left-4 z-50 max-w-[320px] w-full md:w-auto"
                >
                    <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 flex items-start gap-4 pr-8 relative overflow-hidden">
                        {/* Close Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDismissed(true);
                            }}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors z-20"
                        >
                            <X className="w-3 h-3" />
                        </button>

                        {/* Product Image */}
                        <div className="relative w-16 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-100">
                            <Image
                                src={currentSale.image}
                                alt={currentSale.product}
                                fill
                                className="object-cover object-top"
                                sizes="64px"
                            />
                        </div>

                        <div className="flex flex-col justify-center min-h-[80px]">
                            <div className="flex items-center gap-1.5 mb-1">
                                <p className="text-sm font-bold text-gray-900">{currentSale.name}</p>
                                <span className="text-[10px] text-gray-400">in {currentSale.city}</span>
                            </div>

                            <p className="text-xs text-gray-600 mb-1 leading-snug line-clamp-2">
                                purchased <span className="font-semibold text-primary">{currentSale.product}</span>
                            </p>

                            <div className="flex items-center gap-1.5 mt-auto">
                                <span className="text-[10px] text-gray-400">{currentSale.time}</span>
                                <span className="text-[10px] text-green-600 flex items-center gap-0.5 font-medium">
                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                </span>
                            </div>
                        </div>

                        {/* Decorative progress bar at bottom */}
                        <motion.div
                            initial={{ scaleX: 1 }}
                            animate={{ scaleX: 0 }}
                            transition={{ duration: 6, ease: "linear" }}
                            className="absolute bottom-0 left-0 h-0.5 bg-primary origin-left w-full opacity-50"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
