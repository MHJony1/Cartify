import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from '@/providers/AppProviders';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    template: "%s | Cartify",
    default: "Cartify | Premium Fashion & Editorial Apparel",
  },
  description: "Discover curated collections of minimal, sophisticated, and premium fashion at Cartify.",
  openGraph: {
    title: "Cartify | Premium Fashion & Editorial Apparel",
    description: "Discover curated collections of minimal, sophisticated, and premium fashion at Cartify.",
    url: "/",
    siteName: "Cartify",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cartify",
    description: "Discover curated collections of minimal, sophisticated, and premium fashion.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >

      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
