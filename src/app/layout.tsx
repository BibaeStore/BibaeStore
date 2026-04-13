import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import ClientLayout from '@/components/layout/ClientLayout'
import TopLoadingBar from '@/components/TopLoadingBar'
import PageTransition from '@/components/PageTransition'
import Script from 'next/script'
import RecentSalesPopup from '@/components/RecentSalesPopup'
import { getNavCategoriesAction } from '@/app/actions/categories'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://habibaminhas.com/'),
  title: {
    default: 'Elegant Ethnic Wear & Handcrafted Accessories | Habiba Minhas',
    template: '%s | Habiba Minhas'
  },
  description: 'Experience the pinnacle of boutique shopping at Habiba Minhas. Handcrafted premium fashion, exclusive 2026 collections, and fast delivery across Pakistan.',
  keywords: ['boutique store pakistan', 'handcrafted dresses', 'premium fashion brand', 'boutique wear 2026', 'luxury ethnic wear'],
  authors: [{ name: 'Habiba Minhas Team' }],
  creator: 'Habiba Minhas',
  publisher: 'Habiba Minhas',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: 'https://habibaminhas.com/',
    siteName: 'Habiba Minhas',
    title: 'Elegant Ethnic Wear & Handcrafted Accessories | Habiba Minhas',
    description: 'Elevate your style with Habiba Minhas’s handcrafted collections. Luxury boutique wear delivered to your doorstep.',
    images: [
      {
        url: '/assets/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Habiba Minhas Premium Collection',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elegant Ethnic Wear & Handcrafted Accessories | Habiba Minhas',
    description: 'Elevate your style with Habiba Minhas’s handcrafted collections.',
    images: ['/assets/og-image.png'],
    creator: '@habibaminhas',
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
  verification: {
    google: 'W-KHy_6FCa02fzk6IOpF0XTePI10l3bJh9f2lyI6sVQ',
    other: {
      'msvalidate.01': 'FC185BBAD92362483C84F966F358A41C',
    },
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getNavCategoriesAction()
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Habiba Minhas',
    url: 'https://habibaminhas.com/',
    logo: 'https://habibaminhas.com/assets/logo.png',
    sameAs: [
      'https://www.facebook.com/profile.php?id=61574335512818',
      'https://instagram.com/habibaminhas',
      'https://whatsapp.com/channel/0029ValpOfX0VycNpKpxmK3O'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+92-334-8438007',
      contactType: 'customer service',
      areaServed: 'PK',
      availableLanguage: ['English', 'Urdu']
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Karachi',
      addressRegion: 'Sindh',
      postalCode: '75533',
      addressCountry: 'PK'
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="bg-background antialiased" suppressHydrationWarning>
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
            })(window, document, "clarity", "script", "waxofnoq5n");
          `}
        </Script>
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="CyuaV61WFAlxsva4awSxVA"
          strategy="afterInteractive"
        />
        {/* Trustpilot Widget Bootstrap */}
        <Script
          src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
          strategy="afterInteractive"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Providers>
          <TopLoadingBar />
          <ClientLayout initialCategories={categories}>
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
