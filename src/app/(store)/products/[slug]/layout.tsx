import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const formattedTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return {
      title: formattedTitle,
      description: `Shop the exclusive ${formattedTitle} at Cartify. Minimal, sophisticated, and premium fashion.`,
      openGraph: {
        title: `${formattedTitle} | Cartify`,
        description: `Shop the exclusive ${formattedTitle} at Cartify.`,
      }
    };
  } catch (error) {
    return {
      title: 'Product',
    };
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
