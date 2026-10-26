import React from 'react';
import Link from 'next/link';

const CATEGORIES = [
  { 
    id: 'women', 
    name: 'Women', 
    href: '/categories/women',
    image: 'https://images.unsplash.com/photo-1485230405346-71acb9518d9c?q=80&w=1200&auto=format&fit=crop',
    number: '01',
    exploreText: 'Explore Collection'
  },
  { 
    id: 'men', 
    name: 'Men', 
    href: '/categories/men',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1200&auto=format&fit=crop',
    number: '02',
    exploreText: 'Explore Collection'
  },
  { 
    id: 'kids', 
    name: 'Kids', 
    href: '/categories/kids',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop',
    number: '03',
    exploreText: 'Explore Collection'
  },
  { 
    id: 'accessories', 
    name: 'Accessories', 
    href: '/shop?search=accessories',
    // Minimal premium accessories photo with no recognizable branding
    image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop',
    number: '04',
    exploreText: 'Explore Collection'
  },
  {
    id: 'sale',
    name: 'Sale',
    href: '/shop?sale=true',
    image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=800&auto=format&fit=crop',
    number: '05',
    exploreText: 'Shop Sale'
  }
];

export function CategoryShowcase() {
  return (
    <section className="py-10 md:py-16 lg:py-20 bg-background overflow-hidden">
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center mb-12 md:mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-4">Shop by Category</h2>
          <p className="text-sm md:text-base text-muted-foreground font-medium tracking-wide">
            Explore the collections that define your style.
          </p>
          <div className="h-px w-12 bg-foreground mt-8"></div>
        </div>

        {/* Editorial Asymmetric Grid */}
        <div className="grid grid-cols-12 gap-3 md:gap-4">
          {CATEGORIES.map((category) => {
            let spanClass = "";
            let aspectClass = "";
            
            switch (category.id) {
              case 'women':
                spanClass = "col-span-12 md:col-span-7";
                aspectClass = "aspect-[4/3] md:aspect-auto md:h-[600px] lg:h-[700px]";
                break;
              case 'men':
                spanClass = "col-span-12 md:col-span-5";
                aspectClass = "aspect-[3/4] md:aspect-auto md:h-[600px] lg:h-[700px]";
                break;
              case 'kids':
                spanClass = "col-span-6 md:col-span-4";
                aspectClass = "aspect-[3/4] md:aspect-[4/5]";
                break;
              case 'accessories':
                spanClass = "col-span-6 md:col-span-4";
                aspectClass = "aspect-[3/4] md:aspect-[4/5]";
                break;
              case 'sale':
                spanClass = "col-span-12 md:col-span-4";
                aspectClass = "aspect-[21/9] md:aspect-[4/5]";
                break;
            }

            return (
              <Link 
                key={category.id} 
                href={category.href}
                className={`group block relative overflow-hidden bg-muted shadow-sm hover:shadow-md transition-shadow duration-500 rounded-sm ${spanClass} ${aspectClass}`}
                aria-label={`Shop ${category.name}`}
              >
                {/* Background Image with Zoom on Hover */}
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                
                {/* Subtle Editorial Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/10 opacity-70 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 p-5 md:p-8 flex flex-col justify-between pointer-events-none">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-white/90 tracking-widest">{category.number} / {category.name.toUpperCase()}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tighter text-white uppercase mb-2 md:mb-3 drop-shadow-md">
                      {category.name}
                    </h3>
                    <div className="flex items-center text-[10px] md:text-xs font-semibold uppercase tracking-widest text-white/90 transition-transform duration-500 ease-out group-hover:translate-x-2">
                      {category.exploreText} <span className="ml-2 font-light text-sm">&rarr;</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}
