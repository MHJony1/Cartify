import React from "react";
import { Metadata } from "next";
import { productsApi } from "@/features/products/api/products.api";
import { ProductDetailsClient } from "./ProductDetailsClient";
import { env } from "@/config/env";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const product = await productsApi.getProductById(resolvedParams.slug);

    if (!product) {
      return {
        title: "Product Not Found - Cartify",
        description: "The product you are looking for could not be found.",
      };
    }

    const primaryImage = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || "";
    const imageUrl = primaryImage.startsWith("http") 
      ? primaryImage 
      : `${env.NEXT_PUBLIC_API_URL.replace("/api/v1", "")}${primaryImage.startsWith("/") ? "" : "/"}${primaryImage}`;

    return {
      title: `${product.name} | Cartify`,
      description: product.description?.substring(0, 160) || `Buy ${product.name} at Cartify.`,
      openGraph: {
        title: product.name,
        description: product.description?.substring(0, 160) || `Buy ${product.name} at Cartify.`,
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 1066,
            alt: product.name,
          },
        ],
      },
    };
  } catch (error) {
    return {
      title: "Product - Cartify",
      description: "View product details on Cartify.",
    };
  }
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  let initialData = null;
  
  try {
    initialData = await productsApi.getProductById(resolvedParams.slug);
  } catch (error) {
    // If it fails on the server, we let the client component handle the error state 
    // or re-fetch gracefully.
  }

  return (
    <ProductDetailsClient slug={resolvedParams.slug} initialData={initialData} />
  );
}
