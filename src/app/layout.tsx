import type { Metadata, Viewport } from 'next'
import './globals.css'
import CoracoesFlutuantes from '@/components/CoracoesFlutuantes'
import { CONFIG } from '@/lib/config'

export const metadata: Metadata = {
  title: CONFIG.titulo,
  description: 'Um cantinho só nosso.',
  applicationName: CONFIG.titulo,
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: CONFIG.titulo, statusBarStyle: 'black-translucent' },
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#240812',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Playfair+Display:wght@500;700&display=swap"
        />
      </head>
      <body>
        <CoracoesFlutuantes />
        {children}
      </body>
    </html>
  )
}
