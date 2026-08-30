import { StorefrontLayout } from '@/components/layout/storefront/StorefrontLayout';
import {
  HeroSection,
  CategoryShowcase,
  FeaturedProductsSection,
  PromoSection,
  BestSellersSection,
  BenefitsSection,
  TestimonialsSection,
  NewsletterSection,
} from '@/features/home';

export default function Home() {
  return (
    <StorefrontLayout>
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProductsSection />
      <PromoSection />
      <BestSellersSection />
      <BenefitsSection />
      <TestimonialsSection />
      <NewsletterSection />
    </StorefrontLayout>
  );
}
