'use client'

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getNavCategoriesAction, NavCategory } from "@/app/actions/categories";
import ProductCard from "@/components/ProductCard";
import { createClient } from "@/lib/supabase/client";
import { getShopProductsAction } from "@/app/shop/actions";
import { toast } from "sonner";
import { ProductGridSkeleton } from "@/components/SkeletonLoader";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Search, Grid3X3, LayoutGrid } from "lucide-react";
import { Product } from "@/types/product";

interface ShopContentProps {
  initialProducts: Product[];
  initialTitle?: string;
  isCategoryPage?: boolean;
}

export default function ShopContent({ initialProducts, initialTitle, isCategoryPage }: ShopContentProps) {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category") || "";
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialTitle || categoryFilter);
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [categoryTree, setCategoryTree] = useState<NavCategory[]>([]);
  const [gridCols, setGridCols] = useState(4);
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    // Only overwrite if it's a real change from the filter UI/URL
    // If we have an initialTitle from the server, don't overwrite it with empty categoryFilter on mount
    if (categoryFilter) {
      setSelectedCategory(categoryFilter);
    }
  }, [categoryFilter]);

  // Fetch category tree for grouped filters
  useEffect(() => {
    getNavCategoriesAction().then(setCategoryTree).catch(() => {});
  }, []);

  // Use server-fetched data as initial state (no loading spinner needed)
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filtered, setFiltered] = useState<Product[]>(initialProducts);

  // Realtime subscription — re-fetches when admin makes changes
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('shop-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async () => {
          // Re-fetch via server action for realtime updates
          try {
            const result = await getShopProductsAction();
            if (!result.error) setProducts(result.data as Product[]);
          } catch (error) {
            console.error("Failed to refresh products:", error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Client-side filtering/sorting
  useEffect(() => {
    setIsFiltering(true);

    const timer = setTimeout(() => {
      let result = products;
      // On category pages, products are already server-filtered. Only apply subcategory filter if explicitly changed.
      if (selectedCategory && !(isCategoryPage && selectedCategory === initialTitle)) {
        result = result.filter((p) => {
          const productCategoryName = typeof p.category === 'object' && p.category !== null && 'name' in p.category
            ? (p.category as any).name
            : (typeof p.category === 'string' ? p.category : '');
          return productCategoryName === selectedCategory;
        });
      }
      if (search) result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
      if (sortBy === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
      if (sortBy === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
      if (sortBy === "newest") result = [...result].sort((a, b) => (new Date(b.created_at || '').getTime()) - (new Date(a.created_at || '').getTime()));

      setFiltered(result);
      setIsFiltering(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedCategory, search, sortBy, products]);

  // JSON-LD for Collection Page (Product Group Schema)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: selectedCategory ? `${selectedCategory} Collection` : 'Shop All Products | Habiba Minhas',
    description: `Discover our exclusive ${selectedCategory?.toLowerCase() || ''} collection. Handcrafted premium boutique fashion with fast delivery in Pakistan.`,
    url: selectedCategory
      ? `https://habibaminhas.com/shop/category/${selectedCategory.toLowerCase().replace(/\s+/g, '-')}/`
      : 'https://habibaminhas.com/shop/',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: filtered.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://habibaminhas.com/shop/${product.slug || product.id}/`,
        name: product.name,
      })),
    },
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
            {selectedCategory ? `${selectedCategory} Collection` : "All Shop Collection"}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl md:text-6xl font-light mb-3"
          >
            {selectedCategory || "All Shop Collection"}
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
              <h2 className="font-heading text-lg mb-4">Categories</h2>
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`px-5 py-2.5 text-xs font-body tracking-wider border transition-colors ${!selectedCategory ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}
                >
                  All
                </button>
                {categoryTree.map((parent) => (
                  <div key={parent.id}>
                    <button
                      onClick={() => setSelectedCategory(parent.name)}
                      className={`px-5 py-2.5 text-xs font-body tracking-wider uppercase border transition-colors font-semibold ${selectedCategory === parent.name ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}
                    >
                      {parent.name}
                    </button>
                    {parent.subcategories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 ml-4">
                        {parent.subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => setSelectedCategory(sub.name)}
                            className={`px-4 py-2 text-xs font-body tracking-wider border transition-colors ${selectedCategory === sub.name ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  price: product.sale_price || product.price,
                  originalPrice: product.sale_price ? product.price : null,
                  image: product.images?.[0] || '/assets/placeholder.jpg',
                  category: product.category?.name || 'Uncategorized',
                  isNew: product.created_at ? (new Date().getTime() - new Date(product.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000 : false
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
