'use client';

import { QueryProvider } from './QueryProvider';
import { ToastProvider } from './ToastProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {/* 
        Add other global providers here:
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem> 
      */}
      {children}
      <ToastProvider />
      {/* </ThemeProvider> */}
    </QueryProvider>
  );
}
