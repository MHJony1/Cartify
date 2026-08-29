'use client';

import { QueryProvider } from './QueryProvider';
import { ToastProvider } from './ToastProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <ToastProvider />
    </QueryProvider>
  );
}
