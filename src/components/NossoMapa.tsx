'use client'

import dynamic from 'next/dynamic'
import type { PontoMapa } from '@/lib/tipos'

const MapaInterno = dynamic(() => import('./NossoMapaInterno'), {
  ssr: false,
  loading: () => <p className="vazio">Carregando o mapa…</p>,
})

export default function NossoMapa({ inicial }: { inicial: PontoMapa[] }) {
  return (
    <section className="secao" aria-label="Nosso mapa">
      <h2 className="secao-titulo">Nosso Mapa</h2>
      <p className="secao-sub">Toque em qualquer ponto do mapa para marcar um coração.</p>
      <MapaInterno inicial={inicial} />
    </section>
  )
}
