'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';

export const GoogleAuthProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com';
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
};
