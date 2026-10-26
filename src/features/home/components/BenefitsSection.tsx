import React from 'react';
import { Package, ShieldCheck, RefreshCw, HeartHandshake } from 'lucide-react';

const BENEFITS = [
  {
    icon: <Package className="h-5 w-5" />,
    title: 'Complimentary Shipping',
    description: 'On all orders over ৳5000',
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Secure Checkout',
    description: '100% secure payment gateways',
  },
  {
    icon: <RefreshCw className="h-5 w-5" />,
    title: 'Free Returns',
    description: '30-day hassle-free return policy',
  },
  {
    icon: <HeartHandshake className="h-5 w-5" />,
    title: 'Conscious Craft',
    description: 'Ethically sourced materials',
  },
];

export function BenefitsSection() {
  return (
    <section className="border-t border-border/50 bg-background py-10 md:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-foreground">
                {benefit.icon}
              </div>
              <h3 className="mb-2 text-[13px] font-bold uppercase tracking-[0.15em] text-foreground">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground font-medium">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

