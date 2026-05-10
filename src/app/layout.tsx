import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/lib/cart'

export const metadata: Metadata = {
  title: 'FLOW — Modern Slow Bar',
  description: 'Precision-brewed juicy coffee served at peak flow. Reserve your daily cup.',
  keywords: 'specialty coffee, slow bar, pour over, precision brew, limited cups',
  openGraph: {
    title: 'FLOW — Modern Slow Bar',
    description: 'Precision-brewed juicy coffee served at peak flow.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="noise-bg">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
