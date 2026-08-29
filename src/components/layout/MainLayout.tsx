import React from 'react';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header will go here */}
      <main className="flex-1">
        {children}
      </main>
      {/* Footer will go here */}
    </div>
  );
}
