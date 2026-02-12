import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import ClientLayout from '@/components/layout/ClientLayout'
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
      <body className="bg-background antialiased">
        <Providers>
          <TopLoadingBar />
          <ClientLayout>
            <PageTransition>
              {children}
            </PageTransition>
          </ClientLayout>
        </Providers>
      </body>
    </html>
  )
}
