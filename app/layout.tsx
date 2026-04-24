import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Craftsmanship Oasis — Student Tech Marketplace',
  description: 'The boutique tech forge where student engineers build for brands.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
