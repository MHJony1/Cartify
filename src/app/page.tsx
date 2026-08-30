import { StorefrontLayout } from '@/components/layout/storefront/StorefrontLayout';
import {
  HeroSection,
  CategoryShowcase,
  FeaturedProductsSection,
  EditorialSection,
  PromoSection,
  BestSellersSection,
  BenefitsSection,
  NewsletterSection,
} from '@/features/home';

export default function Home() {
  return (
    <StorefrontLayout>
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProductsSection />
      <EditorialSection />
      <PromoSection />
      <BestSellersSection />
      <BenefitsSection />
      <NewsletterSection />
    </StorefrontLayout>
  );
}
