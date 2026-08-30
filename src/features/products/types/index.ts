export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  sku: string;
  price: number;
  stock: number;
  compareAtPrice?: number | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  slug: string;
  gender?: string | null;
  material?: string | null;
  brand?: string | null;
  collection?: string | null;
  categoryId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  
  category?: Category;
  images: ProductImage[];
  variants: ProductVariant[];
}
