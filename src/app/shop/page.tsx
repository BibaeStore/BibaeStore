import { Suspense } from "react";
import { getProducts } from "@/lib/server-queries";
import ShopContent from "./ShopContent";

export default async function Shop() {
  const products = await getProducts();

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Store...</div>}>
      <ShopContent initialProducts={products} />
    </Suspense>
  );
}
