import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TopLoadingBar from '@/components/TopLoadingBar'
import PageTransition from '@/components/PageTransition'

export const metadata: Metadata = {
  title: 'Bibae Store',
  description: 'Bibae Boutique Hub',
  icons: {
    icon: '/assets/icon.png'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <TopLoadingBar />
          <React.Suspense fallback={<div className="h-20 bg-background" />}>
            <Header />
          </React.Suspense>
          <PageTransition>
            {children}
          </PageTransition>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
