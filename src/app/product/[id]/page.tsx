'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, ShoppingBag, Star, Truck, Shield, RotateCcw, Check, Minus, Plus, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { ProductService } from "@/services/product.service";
import { ClientService } from "@/services/client.service";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import Link from "next/link";

// Skeleton Loader
function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 bg-gray-200 w-1/4 mb-8 rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="bg-gray-200 aspect-square rounded-xl w-full"></div>
          <div className="flex gap-4">
            <div className="bg-gray-200 h-24 w-24 rounded-lg"></div>
            <div className="bg-gray-200 h-24 w-24 rounded-lg"></div>
            <div className="bg-gray-200 h-24 w-24 rounded-lg"></div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 w-3/4 rounded"></div>
          <div className="h-6 bg-gray-200 w-1/4 rounded"></div>
          <div className="h-24 bg-gray-200 w-full rounded"></div>
          <div className="h-10 bg-gray-200 w-1/3 rounded"></div>
        </div>
      </div>
    </div>
  )
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [activeImage, setActiveImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageZoom, setImageZoom] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadProduct() {
      if (!params?.id) return;
      try {
        setLoading(true);
        const data = await ProductService.getProduct(params.id as string);
        if (data) {
          setProduct(data);
          setActiveImage(data.images?.[0] || '/assets/placeholder.jpg');

          // Initialize defaults if available
          if (data.sizes && data.sizes.length > 0) setSelectedSize("");
          if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);

          // Fetch related products (same category)
          if (data.category_id) {
            const allProducts = await ProductService.getProducts();
            const related = allProducts
              .filter((p: any) => p.category_id === data.category_id && p.id !== data.id)
              .slice(0, 4);
            setRelatedProducts(related);
          }

          // Fetch reviews
          const reviewsData = await ClientService.getRatings(params.id as string);
          setReviews(reviewsData);

          // Get session
          const { data: { session } } = await supabase.auth.getSession();
          setUserSession(session);
        }
      } catch (error: any) {
        console.error("Failed to load product:", error);
        console.error("Product load error details:", {
          message: error?.message,
          code: error?.code,
          hint: error?.hint,
          details: error?.details
        });
        toast.error(`Failed to load product: ${error?.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [params?.id]);

  const handleAddToCart = () => {
    if (!userSession) {
      toast.error("Please login to add items to your cart");
      router.push("/login?redirectedFrom=" + window.location.pathname);
      return;
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    // Add items based on quantity
    addItem({
      ...product,
      image: product.images?.[0] || '/assets/placeholder.jpg',
      originalPrice: product.sale_price || product.price
    }, selectedSize, selectedColor || "Default", quantity);
    setAddedToCart(true);
    toast.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart!`);
    setTimeout(() => {
      setAddedToCart(false);
      setQuantity(1);
    }, 2000);
  };

  const handleSubmitReview = async () => {
    if (!userSession) return;
    if (userRating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setSubmittingReview(true);
    try {
      await ClientService.submitRating({
        product_id: product.id,
        client_id: userSession.user.id,
        rating: userRating,
        comment: userComment
      });
      toast.success("Thank you for your review!");
      setUserComment("");
      setUserRating(0);
      // Refresh reviews
      const reviewsData = await ClientService.getRatings(params.id as string);
      setReviews(reviewsData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit review. You might have already rated this product.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <ProductDetailSkeleton />;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const discount = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  // Safe defaults for arrays
  const sizes = product.sizes || ['S', 'M', 'L', 'XL']; // Fallback if not in DB yet
  const colors = product.colors || ['Standard'];

  return (
    <main className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-muted/50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <motion.div
              className="aspect-[3/4] overflow-hidden bg-muted sticky top-28 cursor-zoom-in group rounded-2xl border border-gray-200"
              onMouseEnter={() => setImageZoom(true)}
              onMouseLeave={() => setImageZoom(false)}
            >
              <motion.img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500"
                animate={{ scale: imageZoom ? 1.1 : 1 }}
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_featured && (
                  <span className="bg-foreground text-background text-[10px] font-body font-semibold tracking-wider uppercase px-3 py-1.5">Featured</span>
                )}
                {discount > 0 && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-body font-semibold tracking-wider px-3 py-1.5">-{discount}% Off</span>
                )}
              </div>
            </motion.div>
            <div className="flex gap-4 overflow-x-auto pb-2 mt-4">
              {[activeImage, ...(product.images || []).filter((img: string) => img !== activeImage)].map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img ? "border-primary shadow-sm" : "border-transparent hover:border-gray-300"
                    }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} view ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                {product.category?.name || 'Collection'}
              </Badge>
              <p className="text-xs font-body text-muted-foreground tracking-[0.1em] uppercase">SKU: {product.sku}</p>
            </div>

            <h1 className="font-heading text-3xl md:text-5xl font-light mb-4 leading-tight text-gray-900">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < 4 ? "fill-primary text-primary" : "text-border"}`} // Mock rating for now
                  />
                ))}
              </div>
              <span className="text-sm font-body font-medium">4.8</span>
              <span className="text-xs font-body text-muted-foreground">(24 reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="font-heading text-3xl text-gray-900">
                {formatPrice(product.sale_price || product.price)}
              </span>
              {product.sale_price && (
                <>
                  <span className="text-muted-foreground line-through font-body text-lg">{formatPrice(product.price)}</span>
                  <span className="bg-red-50 text-red-600 px-2.5 py-1 text-xs font-body font-semibold border border-red-100 rounded-sm">Save {Math.round(((product.price - product.sale_price) / product.price) * 100)}%</span>
                </>
              )}
            </div>

            <div className="w-full h-[1px] bg-border mb-8" />

            <div className="prose prose-sm text-gray-600 mb-8">
              <p>{product.description}</p>
            </div>

            {/* Size */}
            {sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-body font-medium tracking-wider uppercase">Size</p>
                  <button className="text-xs font-body text-primary hover:underline">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[50px] px-4 py-2.5 text-sm font-body border transition-all duration-200 ${selectedSize === size ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color */}
            {colors.length > 0 && (
              <div className="mb-8">
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

            {/* Quantity */}
            <div className="mb-8">
              <p className="text-sm font-body font-medium mb-3 tracking-wider uppercase">Quantity</p>
              <div className="flex items-center border border-border w-fit rounded-sm overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-muted transition-colors disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 text-sm font-body font-medium min-w-[60px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="p-3 hover:bg-muted transition-colors disabled:opacity-50"
                  disabled={quantity >= 10}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <motion.button
                onClick={handleAddToCart}
                whileTap={{ scale: 0.97 }}
                className={`flex-1 py-4 text-sm font-body font-medium tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${addedToCart ? "bg-green-600 text-background" : "bg-gray-900 text-white hover:bg-gray-800 shadow-button hover:shadow-button-hover"}`}
              >
                {addedToCart ? (
                  <><Check className="w-4 h-4" /> Added!</>
                ) : (
                  <><ShoppingBag className="w-4 h-4" /> Add to Cart</>
                )}
              </motion.button>
              <button className="border border-border p-4 hover:border-primary hover:text-primary transition-colors hover:shadow-sm">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Stock */}
            <p className={`text-xs font-body mb-8 ${product.status === 'active' ? "text-green-600" : "text-destructive"}`}>
              {product.status === 'active' ? "✓ In Stock — Ready to Ship" : "✕ Out of Stock"}
            </p>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 border border-border rounded-lg">
              <div className="text-center">
                <Truck className="w-5 h-5 mx-auto mb-1.5 text-primary" strokeWidth={1.5} />
                <p className="text-[10px] font-body text-muted-foreground">Free Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="w-5 h-5 mx-auto mb-1.5 text-primary" strokeWidth={1.5} />
                <p className="text-[10px] font-body text-muted-foreground">Quality Assured</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-5 h-5 mx-auto mb-1.5 text-primary" strokeWidth={1.5} />
                <p className="text-[10px] font-body text-muted-foreground">Easy Returns</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Ratings & Reviews Section */}
        <section className="mt-20 border-t pt-12">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Summary */}
            <div className="md:w-1/3">
              <h3 className="font-heading text-2xl mb-6">Customer Reviews</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl font-heading font-light">
                  {reviews.length > 0
                    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                    : "0.0"}
                </div>
                <div>
                  <div className="flex mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? "fill-primary text-primary" : "text-border"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Based on {reviews.length} reviews</p>
                </div>
              </div>

              {/* Write a Review */}
              <div className="mt-8 p-6 bg-muted/30 rounded-2xl border border-border">
                <h4 className="font-heading text-lg mb-2">Share your thoughts</h4>
                <p className="text-sm text-muted-foreground mb-4">How was your experience with this product?</p>
                {userSession ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setUserRating(s)} className="focus:outline-none group">
                          <Star className={`w-6 h-6 transition-all ${s <= userRating ? "fill-primary text-primary" : "text-gray-300 hover:text-primary/50"}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="w-full bg-white border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="Write your review here..."
                      rows={3}
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                    />
                    <Button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || userRating === 0}
                      className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg h-10 text-xs font-bold uppercase tracking-widest"
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                ) : (
                  <Link href="/login" className="inline-block text-primary text-sm font-bold hover:underline">Login to write a review</Link>
                )}
              </div>
            </div>

            {/* Reviews List */}
            <div className="md:w-2/3 space-y-8">
              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                reviews.map((review: any) => (
                  <div key={review.id} className="pb-8 border-b border-border last:border-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center relative overflow-hidden">
                        {review.client?.profile_image_url ? (
                          <Image src={review.client.profile_image_url} alt={review.client.full_name} fill className="object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-gray-900">{review.client?.full_name || "Anonymous"}</h5>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-primary text-primary" : "text-border"}`} />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 mb-10">
            <div className="text-center mb-10">
              <p className="text-primary font-body text-xs tracking-[0.3em] uppercase mb-2">More to Love</p>
              <h2 className="font-heading text-3xl md:text-4xl font-light">You May Also Like</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={{
                    ...p,
                    image: p.images?.[0] || '/assets/placeholder.jpg',
                    category: p.category?.name || 'Uncategorized',
                    originalPrice: p.sale_price,
                    isNew: p.created_at && (new Date().getTime() - new Date(p.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000
                  }}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
