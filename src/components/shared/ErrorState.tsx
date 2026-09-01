import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  title = 'Something went wrong', 
  message = 'An unexpected error occurred.', 
  onRetry,
  className 
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center border border-border/50 bg-muted/10',
        className
      )}
    >
      <AlertCircle className="h-10 w-10 text-destructive mb-4" />
      <h3 className="text-sm font-bold uppercase tracking-widest mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="uppercase tracking-widest text-xs font-bold px-6 py-3 bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
