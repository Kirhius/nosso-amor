import type { MetadataRoute } from 'next'
import { CONFIG } from '@/lib/config'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: CONFIG.titulo,
    short_name: CONFIG.titulo,
    description: 'Um cantinho só nosso.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#240812',
    theme_color: '#240812',
    lang: 'pt-BR',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
