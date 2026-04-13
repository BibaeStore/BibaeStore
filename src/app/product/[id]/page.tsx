import { notFound, redirect } from "next/navigation";
import { getProduct } from "@/lib/server-queries";

// Force dynamic rendering — never cache this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const product = await getProduct(id);
  if (!product) return notFound();

  // Redirect to the SEO-optimized path in /shop/
  // Trailing slash added for consistency with standard architecture
  redirect(`/shop/${product.slug || product.id}/`);
}
