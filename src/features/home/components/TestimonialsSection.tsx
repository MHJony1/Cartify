import React from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Verified Buyer',
    content: 'The quality of the products I received exceeded my expectations. Fast shipping and excellent packaging. Highly recommended!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Verified Buyer',
    content: 'Cartify has become my go-to store for everyday essentials. Their customer service team is incredibly responsive and helpful.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Verified Buyer',
    content: 'Beautiful design and great functionality. I bought the ergonomic chair and it has completely changed my work-from-home setup.',
    rating: 4,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">What Our Customers Say</h2>
          <p className="mt-2 text-muted-foreground">Don&apos;t just take our word for it</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.id} className="bg-muted/30 border-0">
              <CardContent className="p-6">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < testimonial.rating ? 'fill-primary text-primary' : 'fill-muted text-muted'}`} 
                    />
                  ))}
                </div>
                <p className="mb-6 italic text-muted-foreground">&quot;{testimonial.content}&quot;</p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
