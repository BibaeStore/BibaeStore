// Animation variants and utilities for consistent, smooth animations across the app
import { Variants } from "framer-motion";

// Timing functions optimized for 60fps performance
export const TRANSITIONS = {
    fast: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }, // 200ms - for quick interactions
    normal: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }, // 300ms - default
    slow: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }, // 500ms - for emphasis
    spring: { type: "spring" as const, stiffness: 300, damping: 30 }, // Bouncy feel
    smooth: { type: "spring" as const, stiffness: 100, damping: 20 }, // Smooth spring
};

// Page transition variants
export const pageVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: TRANSITIONS.normal },
    exit: { opacity: 0, y: -20, transition: TRANSITIONS.fast },
};

// Fade variants
export const fadeVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: TRANSITIONS.normal },
    exit: { opacity: 0, transition: TRANSITIONS.fast },
};

// Slide up variants
export const slideUpVariants: Variants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: TRANSITIONS.normal },
    exit: { opacity: 0, y: -30, transition: TRANSITIONS.fast },
};

// Scale variants (for modals, popups)
export const scaleVariants: Variants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: TRANSITIONS.normal },
    exit: { opacity: 0, scale: 0.95, transition: TRANSITIONS.fast },
};

// Stagger children animation
export const staggerContainer: Variants = {
    animate: {
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1,
        },
    },
};

// Individual stagger item
export const staggerItem: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: TRANSITIONS.fast },
};

// Drawer/Sheet variants (from bottom)
export const drawerVariants: Variants = {
    initial: { y: "100%" },
    animate: { y: 0, transition: TRANSITIONS.normal },
    exit: { y: "100%", transition: TRANSITIONS.fast },
};

// Slide from side variants
export const slideFromRightVariants: Variants = {
    initial: { x: "100%" },
    animate: { x: 0, transition: TRANSITIONS.normal },
    exit: { x: "100%", transition: TRANSITIONS.fast },
};

export const slideFromLeftVariants: Variants = {
    initial: { x: "-100%" },
    animate: { x: 0, transition: TRANSITIONS.normal },
    exit: { x: "-100%", transition: TRANSITIONS.fast },
};

// Collapse/Expand variants
export const collapseVariants: Variants = {
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1, transition: TRANSITIONS.normal },
    exit: { height: 0, opacity: 0, transition: TRANSITIONS.fast },
};

// Hover scale effect
export const hoverScale = {
    whileHover: { scale: 1.02, transition: TRANSITIONS.fast },
    whileTap: { scale: 0.98, transition: TRANSITIONS.fast },
};

// Button press effect
export const buttonPress = {
    whileTap: { scale: 0.95, transition: TRANSITIONS.fast },
};

// Shimmer effect for skeleton loaders
export const shimmerVariants: Variants = {
    initial: { backgroundPosition: "-200% 0" },
    animate: {
        backgroundPosition: "200% 0",
        transition: {
            duration: 1.5,
            ease: "linear",
            repeat: Infinity,
        },
    },
};
