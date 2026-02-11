'use client'

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { products, categories, formatPrice } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/SkeletonLoader";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Search, Grid3X3, LayoutGrid } from "lucide-react";

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category") || "";
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter);
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [gridCols, setGridCols] = useState(4);
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    setSelectedCategory(categoryFilter);
  }, [categoryFilter]);

  const filtered = useMemo(() => {
    setIsFiltering(true);
    let result = products;
    if (selectedCategory) result = result.filter((p) => p.category === selectedCategory);
    if (search) result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === "newest") result = [...result].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    if (sortBy === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
    setTimeout(() => setIsFiltering(false), 300);
    return result;
  }, [selectedCategory, search, sortBy]);

  return (
    <main className="min-h-screen">
      {/* Banner */}
      <div className="bg-foreground text-background py-16 md:py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 30% 50%, hsl(var(--primary)) 0%, transparent 50%)"
          }} />
        </div>
        <div className="relative">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-primary font-body text-xs tracking-[0.3em] uppercase mb-3"
          >
            {selectedCategory ? `${selectedCategory} Collection` : "All Collections"}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl md:text-6xl font-light mb-3"
          >
            {selectedCategory || "Shop All"}
          </motion.h1>
          <p className="text-background/40 font-body text-sm tracking-wider">
            {filtered.length} {filtered.length === 1 ? "product" : "products"} available
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 border px-4 py-2.5 text-sm font-body tracking-wider transition-colors ${showFilters ? "bg-foreground text-background border-foreground" : "border-border hover:border-primary"}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory("")}
                className="flex items-center gap-1.5 bg-primary/10 text-foreground px-3 py-2 text-xs font-body tracking-wider hover:bg-primary/20 transition-colors"
              >
                {selectedCategory} <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-border pl-9 pr-4 py-2.5 text-sm font-body bg-transparent focus:outline-none focus:border-primary transition-colors w-40 md:w-56"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-border px-4 py-2.5 text-sm font-body bg-transparent focus:outline-none focus:border-primary"
            >
              <option value="default">Sort by</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="rating">Top Rated</option>
            </select>
            <div className="hidden md:flex items-center border border-border">
              <button
                onClick={() => setGridCols(3)}
                className={`p-2.5 transition-colors ${gridCols === 3 ? "bg-foreground text-background" : "hover:text-primary"}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-2.5 transition-colors ${gridCols === 4 ? "bg-foreground text-background" : "hover:text-primary"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 pb-6 border-b border-border overflow-hidden"
            >
              <h4 className="font-heading text-lg mb-4">Categories</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`px-5 py-2.5 text-xs font-body tracking-wider border transition-colors ${!selectedCategory ? "bg-foreground text-background border-foreground" : "border-border hover:border-primary"}`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-5 py-2.5 text-xs font-body tracking-wider border transition-colors ${selectedCategory === cat.name ? "bg-foreground text-background border-foreground" : "border-border hover:border-primary"}`}
                  >
                    {cat.name}
                    <span className="ml-1 text-muted-foreground">
                      ({products.filter(p => p.category === cat.name).length})
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products grid */}
        {isFiltering ? (
          <ProductGridSkeleton count={8} />
        ) : filtered.length > 0 ? (
          <motion.div
            layout
            className={`grid grid-cols-2 ${gridCols === 3 ? "md:grid-cols-3" : "md:grid-cols-3 lg:grid-cols-4"} gap-4 md:gap-6`}
          >
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <p className="font-heading text-3xl text-muted-foreground mb-2">No products found</p>
            <p className="font-body text-sm text-muted-foreground">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Store...</div>}>
      <ShopContent />
    </Suspense>
  )
}
