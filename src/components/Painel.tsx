'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Curiosidade, Foto, Momento, Viagem } from '@/lib/tipos'
import Cabecalho from './Cabecalho'
import Contador from './Contador'
import { Coracao, IconeBrilho, IconeCamera, IconeLinha, IconePin } from './Icones'
import SecaoCuriosidades from './SecaoCuriosidades'
import SecaoFotos from './SecaoFotos'
import SecaoMomentos from './SecaoMomentos'
import SecaoViagens from './SecaoViagens'

type Aba = 'fotos' | 'momentos' | 'viagens' | 'curiosidades'

export default function Painel({
  fotos,
  momentos,
  viagens,
  curiosidades,
}: {
  fotos: Foto[]
  momentos: Momento[]
  viagens: Viagem[]
  curiosidades: Curiosidade[]
}) {
  const router = useRouter()
  const [aba, setAba] = useState<Aba | null>(null)
  const conteudo = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [])

  function escolher(nova: Aba) {
    const proxima = aba === nova ? null : nova
    setAba(proxima)
    if (proxima) {
      requestAnimationFrame(() => conteudo.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }

  async function sair() {
    await fetch('/api/pin/sair', { method: 'POST' })
    router.refresh()
  }

  const abas: { id: Aba; texto: string; icone: React.ReactNode }[] = [
    { id: 'fotos', texto: 'Fotos', icone: <IconeCamera /> },
    { id: 'momentos', texto: 'Momentos', icone: <IconeLinha /> },
    { id: 'viagens', texto: 'Viagens', icone: <IconePin /> },
    { id: 'curiosidades', texto: 'Curiosidades', icone: <IconeBrilho /> },
  ]

  return (
    <main className="tela">
      <Cabecalho />
      <Contador />

      <nav className="abas" role="tablist" aria-label="Seções">
        {abas.map((a) => (
          <button key={a.id} type="button" role="tab" className="aba" aria-selected={aba === a.id} onClick={() => escolher(a.id)}>
            {a.icone}
            {a.texto}
          </button>
        ))}
      </nav>

      <div ref={conteudo} style={{ scrollMarginTop: 16 }}>
        {aba === 'fotos' && <SecaoFotos inicial={fotos} />}
        {aba === 'momentos' && <SecaoMomentos inicial={momentos} />}
        {aba === 'viagens' && <SecaoViagens inicial={viagens} />}
        {aba === 'curiosidades' && <SecaoCuriosidades inicial={curiosidades} />}
        {aba === null && (
          <p className="secao-sub" style={{ marginBottom: 0 }}>
            Escolha um capítulo da nossa história.
          </p>
        )}
      </div>

      <footer className="rodape-app">
        <button type="button" className="link" onClick={sair}>
          Sair
        </button>
      </footer>

      <div className="fio" style={{ marginTop: 28 }} aria-hidden="true">
        <Coracao cheio />
      </div>
    </main>
  )
}
