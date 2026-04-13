'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: React.ReactNode;
}

interface FAQAccordionProps {
    items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="space-y-4">
            {items.map((item, index) => {
                const isOpen = activeIndex === index;
                return (
                    <div
                        key={index}
                        className={`border rounded-lg overflow-hidden transition-colors duration-200 ${isOpen ? 'border-primary/30 bg-primary/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    >
                        <button
                            onClick={() => toggleAccordion(index)}
                            className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                            aria-expanded={isOpen}
                        >
                            <span className={`font-heading font-medium text-base md:text-lg ${isOpen ? 'text-primary' : 'text-gray-800'}`}>
                                {item.question}
                            </span>
                            <span className={`flex-shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-gray-400'}`}>
                                {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            </span>
                        </button>
                        
                        {/* 
                            For SEO: All content is rendered in the initial HTML. 
                            We use motion.div for animation but the content is always present.
                        */}
                        <motion.div
                            initial={false}
                            animate={{ 
                                height: isOpen ? "auto" : 0,
                                opacity: isOpen ? 1 : 0 
                            }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="p-5 pt-0 text-gray-600 font-body leading-relaxed text-sm md:text-base border-t border-transparent">
                                {item.answer}
                            </div>
                        </motion.div>
                    </div>
                );
            })}
        </div>
    );
}
