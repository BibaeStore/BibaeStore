'use client'

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { pageVariants } from "@/lib/animations";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Skip transition for admin routes to prevent layout remounting
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
