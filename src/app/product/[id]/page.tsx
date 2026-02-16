import { notFound } from "next/navigation";
import { getProduct, getRelatedProducts, getProductReviews } from "@/lib/server-queries";
import ProductContent from "./ProductContent";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const product = await getProduct(id);
  if (!product) return notFound();

  const [relatedProducts, reviews] = await Promise.all([
    product.category_id
      ? getRelatedProducts(product.category_id, product.id)
      : Promise.resolve([]),
    getProductReviews(product.id),
  ]);

  return (
    <ProductContent
      product={product}
      relatedProducts={relatedProducts}
      initialReviews={reviews}
    />
  );
}
