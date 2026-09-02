import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'mark' | 'full';
  onClick?: () => void;
}

export function Logo({ className = '', variant = 'full', onClick }: LogoProps) {
  return (
    <Link 
      href="/" 
      className={cn(
        "flex items-center gap-3 lg:gap-3.5 z-10", 
        className
      )} 
      onClick={onClick}
    >
      {/* Monogram Inline SVG */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 44 48" 
        className={cn(
          "h-10 lg:h-12 w-auto flex-shrink-0 text-foreground overflow-visible",
          variant === 'mark' ? 'h-11 lg:h-12' : ''
        )}
      >
        <g transform="translate(-10, -8)">
          <path d="M42 20H32C23.1634 20 16 27.1634 16 36C16 44.8366 23.1634 52 32 52H42" stroke="currentColor" strokeWidth="6" strokeLinecap="square" fill="none" />
          <path d="M28 12H48V18H34V30H44V36H34V46H28V12Z" fill="currentColor"/>
          <rect x="42" y="12" width="6" height="6" fill="#D4AF37"/>
        </g>
      </svg>
      
      {variant === 'full' && (
        <span className="hidden md:block text-2xl lg:text-[28px] font-black tracking-[0.18em] text-foreground mt-1">
          CARTIFY
        </span>
      )}
      <span className="sr-only">Cartify Home</span>
    </Link>
  );
}
