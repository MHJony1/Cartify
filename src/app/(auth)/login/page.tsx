import { LoginForm } from '@/features/auth/components/LoginForm';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata = {
  title: 'Sign In | Cartify',
  description: 'Sign in to your Cartify account.',
};

export default function LoginPage() {
  return (
    <div className="grow flex w-full">
      {/* Left Side - Image (Hidden on Mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-neutral-100">
        <Image
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop"
          alt="Fashion editorial"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex p-8 sm:p-12 lg:p-24 xl:p-32 relative">
        <div className="w-full max-w-105 m-auto pt-16 lg:pt-0">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
