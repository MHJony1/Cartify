import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  variant?: 'mark' | 'full';
  onClick?: () => void;
}

export function Logo({ className = '', variant = 'full', onClick }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center z-10 ${className}`} onClick={onClick}>
      {variant === 'full' ? (
        <>
          {/* Desktop shows full logo, well balanced size */}
          <img 
            src="/brand/cartify-logo.svg" 
            alt="Cartify" 
            className="hidden md:block h-10 lg:h-[42px] w-auto" 
          />
          <img 
            src="/brand/cartify-mark.svg" 
            alt="Cartify" 
            className="block md:hidden h-10 w-auto" 
          />
        </>
      ) : (
        <img 
          src="/brand/cartify-mark.svg" 
          alt="Cartify" 
          className="h-11 w-auto" 
        />
      )}
      <span className="sr-only">Cartify Home</span>
    </Link>
  );
}
