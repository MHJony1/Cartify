import { StorefrontLayout } from '@/components/layout/storefront/StorefrontLayout';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StorefrontLayout>{children}</StorefrontLayout>;
}
