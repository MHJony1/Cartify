'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';

export const GoogleAuthProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const envClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isPlaceholder = !envClientId || envClientId === 'YOUR_GOOGLE_CLIENT_ID' || !envClientId.includes('.apps.googleusercontent.com');
  
  // Use a strictly valid dummy ID if the real one is a placeholder to prevent the Google script from crashing the page
  const clientId = isPlaceholder 
    ? '1234567890-dummy.apps.googleusercontent.com' 
    : envClientId;
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
};
