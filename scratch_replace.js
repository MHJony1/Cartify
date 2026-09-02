const fs = require('fs');
const files = [
  'src/features/home/components/BestSellersSection.tsx',
  'src/features/home/components/EditorialSection.tsx',
  'src/features/home/components/FeaturedProductsSection.tsx',
  'src/features/home/components/HeroSection.tsx',
  'src/features/home/components/NewsletterSection.tsx',
  'src/features/home/components/PromoSection.tsx',
  'src/features/home/components/TestimonialsSection.tsx',
  'src/features/home/components/CategoryShowcase.tsx',
  'src/features/home/components/BenefitsSection.tsx',
  'src/components/layout/account/AccountLayout.tsx',
  'src/app/(store)/products/[slug]/ProductDetailsClient.tsx',
  'src/app/(store)/shop/page.tsx',
  'src/app/(store)/checkout/page.tsx',
  'src/app/(store)/orders/[id]/page.tsx',
  'src/app/(store)/cart/page.tsx'
];
files.forEach(f => {
  let p = 'c:/Projects/SCPC/Pris+Pstgre new Project/Cartify/' + f;
  if(fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/\"container /g, '\"mx-auto w-full max-w-7xl ');
    content = content.replace(/container mx-auto/g, 'mx-auto w-full max-w-7xl');
    content = content.replace(/\"container\"/g, '\"mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8\"');
    fs.writeFileSync(p, content, 'utf8');
    console.log('updated', f);
  }
});
