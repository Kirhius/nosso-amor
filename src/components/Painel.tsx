'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Autor, Curiosidade, Evento, Foto, Momento, PontoMapa, Viagem } from '@/lib/tipos'
import BotaoNotificacoes from './BotaoNotificacoes'
import Cabecalho from './Cabecalho'
import Contador from './Contador'
import EscolherAutor from './EscolherAutor'
import { Coracao, IconeBrilho, IconeCalendario, IconeCamera, IconeLinha, IconePin, IconeQuiz } from './Icones'
import NossoMapa from './NossoMapa'
import SecaoCuriosidades from './SecaoCuriosidades'
import SecaoEventos from './SecaoEventos'
import SecaoQuiz from './SecaoQuiz'
import SecaoFotos from './SecaoFotos'
import SecaoMomentos from './SecaoMomentos'
import SecaoViagens from './SecaoViagens'

type Aba = 'fotos' | 'momentos' | 'eventos' | 'viagens' | 'mapa' | 'quiz' | 'curiosidades'
const CHAVE_AUTOR = 'amor_autor'

export default function Painel({
  fotos,
  momentos,
  eventos,
  viagens,
  pontosMapa,
  curiosidades,
}: {
  fotos: Foto[]
  momentos: Momento[]
  eventos: Evento[]
  viagens: Viagem[]
  pontosMapa: PontoMapa[]
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
    { id: 'eventos', texto: 'Eventos', icone: <IconeCalendario /> },
    { id: 'viagens', texto: 'Viagens', icone: <IconePin /> },
    { id: 'mapa', texto: 'Nosso Mapa', icone: <Coracao /> },
    { id: 'quiz', texto: 'Quiz', icone: <IconeQuiz /> },
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
        {aba === 'eventos' && <SecaoEventos inicial={eventos} />}
        {aba === 'viagens' && <SecaoViagens inicial={viagens} autor={autor} />}
        {aba === 'mapa' && <NossoMapa inicial={pontosMapa} />}
        {aba === 'quiz' && <SecaoQuiz autor={autor} />}
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
