import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AuditIQ — AI-Powered Shopify Store Audits',
  description: 'Get a complete Shopify store audit in 30 seconds. Discover speed issues, SEO problems, CRO leaks, and revenue opportunities instantly.',
  keywords: ['shopify audit', 'store optimization', 'shopify SEO', 'CRO', 'performance audit', 'ecommerce'],
  authors: [{ name: 'AuditIQ' }],
  openGraph: {
    title: 'AuditIQ — AI-Powered Shopify Store Audits',
    description: 'Get a complete Shopify store audit in 30 seconds.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AuditIQ — AI-Powered Shopify Store Audits',
    description: 'Get a complete Shopify store audit in 30 seconds.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-surface text-gray-900 antialiased`}>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(15,15,26,0.95)',
              border: '1px solid rgba(99,102,241,0.2)',
              color: '#fff',
              backdropFilter: 'blur(20px)',
            },
          }}
        />
      </body>
    </html>
  );
}
