import { RegisterForm } from '@/features/auth/components/RegisterForm';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata = {
  title: 'Create Account | Cartify',
  description: 'Join Cartify for a premium shopping experience.',
};

export default function RegisterPage() {
  return (
    <div className="flex-grow flex w-full">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex p-8 sm:p-12 lg:p-24 xl:p-32 relative order-2 lg:order-1">
        <div className="w-full max-w-[420px] m-auto pt-16 lg:pt-0">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading...</div>}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>

      {/* Right Side - Image (Hidden on Mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-neutral-100 order-1 lg:order-2">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
          alt="Fashion editorial"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/5" />
      </div>
    </div>
  );
}
