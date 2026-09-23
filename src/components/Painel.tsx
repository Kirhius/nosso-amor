'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Autor, Curiosidade, Foto, Momento, Viagem } from '@/lib/tipos'
import BotaoNotificacoes from './BotaoNotificacoes'
import Cabecalho from './Cabecalho'
import Contador from './Contador'
import EscolherAutor from './EscolherAutor'
import { Coracao, IconeBrilho, IconeCamera, IconeLinha, IconePin } from './Icones'
import SecaoCuriosidades from './SecaoCuriosidades'
import SecaoFotos from './SecaoFotos'
import SecaoMomentos from './SecaoMomentos'
import SecaoViagens from './SecaoViagens'

type Aba = 'fotos' | 'momentos' | 'viagens' | 'curiosidades'
const CHAVE_AUTOR = 'amor_autor'

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
  const [autor, setAutor] = useState<Autor | null>(null)
  const [pronto, setPronto] = useState(false)
  const conteudo = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {})
    const salvo = localStorage.getItem(CHAVE_AUTOR)
    if (salvo === 'ele' || salvo === 'ela') setAutor(salvo)
    setPronto(true)
  }, [])

  function escolherAutor(novo: Autor) {
    localStorage.setItem(CHAVE_AUTOR, novo)
    setAutor(novo)
  }

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

  if (!pronto) return null
  if (!autor) return <EscolherAutor onEscolher={escolherAutor} />

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
        {aba === 'fotos' && <SecaoFotos inicial={fotos} autor={autor} />}
        {aba === 'momentos' && <SecaoMomentos inicial={momentos} autor={autor} />}
        {aba === 'viagens' && <SecaoViagens inicial={viagens} autor={autor} />}
        {aba === 'curiosidades' && <SecaoCuriosidades inicial={curiosidades} />}
        {aba === null && (
          <p className="secao-sub" style={{ marginBottom: 0 }}>
            Escolha um capítulo da nossa história.
          </p>
        )}
      </div>

      <footer className="rodape-app">
        <BotaoNotificacoes autor={autor} />
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
