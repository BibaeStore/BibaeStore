'use client'

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { categories, formatPrice } from "@/lib/products"; // Keeping categories for now if needed for filter list, or we fetch them too
import ProductCard from "@/components/ProductCard";
import { ProductService } from "@/services/product.service";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
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

  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from Supabase and subscribe to changes
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await ProductService.getProducts();
        setProducts(data);
        setFiltered(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();

    // Realtime subscription
    const supabase = createClient();
    const channel = supabase
      .channel('shop-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          // Re-fetch on any change
          loadProducts();
          toast.info("Product list updated");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setIsFiltering(true);
    
    const timer = setTimeout(() => {
      let result = products;
      if (selectedCategory) result = result.filter((p) => p.category?.name === selectedCategory);
      if (search) result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
      if (sortBy === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
      if (sortBy === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
      if (sortBy === "newest") result = [...result].sort((a, b) => (new Date(b.created_at).getTime()) - (new Date(a.created_at).getTime()));
      // if (sortBy === "rating") result = [...result].sort((a, b) => b.rating - a.rating); // Rating not yet in DB
      
      setFiltered(result);
      setIsFiltering(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedCategory, search, sortBy, products]);

  return (
    <main className="min-h-screen">
      {/* Banner */}
      {/* Banner */}
      <div className="bg-gray-50 text-gray-900 py-16 md:py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
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
          <p className="text-gray-500 font-body text-sm tracking-wider">
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
              className={`flex items-center gap-2 border px-4 py-2.5 text-sm font-body tracking-wider transition-all shadow-sm ${showFilters ? "bg-primary text-primary-foreground border-primary shadow-md" : "border-gray-300 bg-white hover:border-gray-400 hover:shadow-md"}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory("")}
                className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-foreground px-3 py-2 text-xs font-body tracking-wider hover:bg-primary/20 transition-all shadow-sm"
              >
                {selectedCategory} <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 bg-white pl-9 pr-4 py-2.5 text-sm font-body focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm w-40 md:w-64"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 bg-white px-4 py-2.5 text-sm font-body focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm cursor-pointer hover:border-gray-400"
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
                  className={`px-5 py-2.5 text-xs font-body tracking-wider border transition-colors ${!selectedCategory ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-5 py-2.5 text-xs font-body tracking-wider border transition-colors ${selectedCategory === cat.name ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}
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
        {loading || isFiltering ? (
          <ProductGridSkeleton count={8} />
        ) : filtered.length > 0 ? (
          <motion.div
            layout
            className={`grid grid-cols-2 ${gridCols === 3 ? "md:grid-cols-3" : "md:grid-cols-3 lg:grid-cols-4"} gap-4 md:gap-6`}
          >
            {filtered.map((product, i) => (
              <ProductCard 
                key={product.id} 
                product={{
                  ...product,
                  price: product.sale_price || product.price,
                  originalPrice: product.sale_price ? product.price : null,
                  image: product.images?.[0] || '/assets/placeholder.jpg', // Map first image
                  category: product.category?.name || 'Uncategorized',
                  isNew: product.created_at && (new Date().getTime() - new Date(product.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000
                }} 
                index={i} 
              />
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
