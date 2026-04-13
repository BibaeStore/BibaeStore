'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductGalleryProps {
    images: string[];
    name: string;
    salePrice?: number | null;
}

export default function ProductGallery({ images, name, salePrice }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(images?.[0] || '');

    if (!images || images.length === 0) {
        return (
            <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center text-gray-400">
                No Image Available
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Main Image Container - Optimized for Fashion/Portraits (3:4 Ratio) */}
            <div className="relative aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shadow-sm group">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={selectedImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={selectedImage}
                            alt={name}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Sale Badge */}
                {salePrice && (
                    <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wider rounded-sm shadow-md z-10">
                        Sale
                    </span>
                )}
            </div>

            {/* Thumbnails Grid */}
            {images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {images.map((img, i) => (
                        <button
                            key={`${img}-${i}`}
                            onClick={() => setSelectedImage(img)}
                            className={`relative aspect-[3/4] rounded-md overflow-hidden border-2 transition-all duration-200 ${selectedImage === img
                                ? 'border-primary ring-2 ring-primary/20 ring-offset-1'
                                : 'border-transparent hover:border-gray-300'
                                }`}
                        >
                            <Image
                                src={img}
                                alt={`${name} view ${i + 1}`}
                                fill
                                className="object-cover"
                                sizes="100px"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
