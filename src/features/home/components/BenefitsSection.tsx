import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';

const BENEFITS = [
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'Free Shipping',
    description: 'On all orders over ৳2000',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'Secure Payments',
    description: '100% secure payment gateways',
  },
  {
    icon: <RefreshCw className="h-6 w-6" />,
    title: 'Easy Returns',
    description: '30-day hassle-free return policy',
  },
  {
    icon: <Headphones className="h-6 w-6" />,
    title: '24/7 Support',
    description: 'Dedicated customer support',
  },
];

export function BenefitsSection() {
  return (
    <section className="border-y bg-muted/30 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {benefit.icon}
              </div>
              <h3 className="mb-1 font-semibold text-foreground">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
