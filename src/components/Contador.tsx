'use client'

import { useEffect, useState } from 'react'
import { CONFIG } from '@/lib/config'
import { decompor, type Tempo } from '@/lib/tempo'
import { CAMINHO_CORACAO } from './Icones'

const plural = (n: number, s: string, p: string) => (n === 1 ? s : p)
const dois = (n: number) => String(n).padStart(2, '0')

export default function Contador() {
  const [t, setT] = useState<Tempo | null>(null)

  useEffect(() => {
    const atualizar = () => setT(decompor(Date.now()))
    atualizar()
    const id = setInterval(atualizar, 1000)
    return () => clearInterval(id)
  }, [])

  const v = (n: number | undefined, formato: (n: number) => string = String) => (t && n !== undefined ? formato(n) : '–')

  return (
    <section className="contador" aria-label="Tempo juntos">
      <div className="coracao-fundo" aria-hidden="true">
        <svg viewBox="0 1.5 24 21.5">
          <defs>
            <linearGradient id="gradiente-coracao" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffc2d1" stopOpacity="0.6" />
              <stop offset="1" stopColor="#ff7a9c" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <g className="batida">
            <path
              d={CAMINHO_CORACAO}
              fill="rgba(255,122,156,0.05)"
              stroke="url(#gradiente-coracao)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={CAMINHO_CORACAO}
              transform="translate(12 12.2) scale(0.84) translate(-12 -12.2)"
              fill="none"
              stroke="url(#gradiente-coracao)"
              strokeOpacity="0.55"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        </svg>
      </div>

      <div className="contador-conteudo">
        <div className="juntos-ha">Juntos há</div>

        <div className="linha-tempo grande">
          <div className="unidade">
            <span className="num">{v(t?.anos)}</span>
            <span className="rotulo">{t ? plural(t.anos, 'ano', 'anos') : 'anos'}</span>
          </div>
          <div className="unidade">
            <span className="num">{v(t?.meses)}</span>
            <span className="rotulo">{t ? plural(t.meses, 'mês', 'meses') : 'meses'}</span>
          </div>
          <div className="unidade">
            <span className="num">{v(t?.dias)}</span>
            <span className="rotulo">{t ? plural(t.dias, 'dia', 'dias') : 'dias'}</span>
          </div>
        </div>

        <div className="linha-tempo pequena">
          <div className="unidade">
            <span className="num">{v(t?.horas, dois)}</span>
            <span className="rotulo">{t ? plural(t.horas, 'hora', 'horas') : 'horas'}</span>
          </div>
          <div className="unidade">
            <span className="num">{v(t?.minutos, dois)}</span>
            <span className="rotulo">{t ? plural(t.minutos, 'minuto', 'minutos') : 'minutos'}</span>
          </div>
          <div className="unidade seg">
            <span className="num">{v(t?.segundos, dois)}</span>
            <span className="rotulo">{t ? plural(t.segundos, 'segundo', 'segundos') : 'segundos'}</span>
          </div>
        </div>

        <p className="desde">{CONFIG.inicioTexto}</p>
      </div>
    </section>
  )
}
