'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/shared/ErrorState';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in the future
    console.error('Global Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <ErrorState 
        title="Oops! Something went wrong." 
        message={error.message || 'An unexpected error has occurred.'}
        onRetry={reset} 
      />
    </div>
  );
}
