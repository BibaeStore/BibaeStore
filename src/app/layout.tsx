import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import ClientLayout from '@/components/layout/ClientLayout'
import TopLoadingBar from '@/components/TopLoadingBar'
import PageTransition from '@/components/PageTransition'
import Script from 'next/script'
import RecentSalesPopup from '@/components/RecentSalesPopup'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://bibaestore.com'),
  title: {
    default: 'Bibae Store | Premium Boutique & Handcrafted Fashion',
    template: '%s | Bibae Store'
  },
  description: 'Experience the pinnacle of boutique shopping at Bibae Store. Handcrafted premium fashion, exclusive 2026 collections, and fast delivery across Pakistan.',
  keywords: ['boutique store pakistan', 'handcrafted dresses', 'premium fashion brand', 'boutique wear 2026', 'luxury ethnic wear'],
  authors: [{ name: 'Bibae Team' }],
  creator: 'Bibae Store',
  publisher: 'Bibae Store',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: 'https://bibaestore.com',
    siteName: 'Bibae Store',
    title: 'Bibae Store | Premium Boutique Fashion',
    description: 'Elevate your style with Bibaé’s handcrafted collections. Luxury boutique wear delivered to your doorstep.',
    images: [
      {
        url: '/assets/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bibae Store Premium Collection',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bibae Store | Premium Boutique Fashion',
    description: 'Elevate your style with Bibaé’s handcrafted collections.',
    images: ['/assets/og-image.png'],
    creator: '@bibaestore',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/assets/icon.png',
    shortcut: '/assets/icon.png',
    apple: '/assets/icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bibae Store',
    url: 'https://bibaestore.com',
    logo: 'https://bibaestore.com/assets/logo.png',
    sameAs: [
      'https://facebook.com/bibaestore',
      'https://instagram.com/bibaestore',
      'https://whatsapp.com/channel/0029ValpOfX0VycNpKpxmK3O'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+92-334-8438007',
      contactType: 'customer service',
      areaServed: 'PK',
      availableLanguage: ['English', 'Urdu']
    }
  };

  return (
    <html lang="en">
      <body className="bg-background antialiased">
        {/* Google Analytics Tag */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9K3MNB77CZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9K3MNB77CZ');
          `}
        </Script>
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "vifnmu1rv4");
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Providers>
          <TopLoadingBar />
          <ClientLayout>
            <PageTransition>
              {children}
            </PageTransition>
            <RecentSalesPopup />
          </ClientLayout>
        </Providers>
      </body>
    </html>
  )
}
