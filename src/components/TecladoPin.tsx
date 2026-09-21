'use client'

import { useEffect } from 'react'
import { Coracao, IconeApagar } from './Icones'

type Props = {
  valor: string
  onChange: (novo: string) => void
  desabilitado?: boolean
  tremer?: boolean
}

export default function TecladoPin({ valor, onChange, desabilitado = false, tremer = false }: Props) {
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (desabilitado) return
      if (/^\d$/.test(e.key) && valor.length < 4) onChange(valor + e.key)
      else if (e.key === 'Backspace') onChange(valor.slice(0, -1))
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [valor, desabilitado, onChange])

  const digitar = (d: string) => {
    if (!desabilitado && valor.length < 4) onChange(valor + d)
  }

  return (
    <div>
      <div className={`pin-coracoes${tremer ? ' tremer' : ''}`} role="img" aria-label={`${valor.length} de 4 dígitos`}>
        {[0, 1, 2, 3].map((i) => (
          <Coracao key={i} cheio={i < valor.length} className={i < valor.length ? 'cheio' : ''} />
        ))}
      </div>

      <div className="teclado">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} type="button" className="tecla" onClick={() => digitar(d)} disabled={desabilitado}>
            {d}
          </button>
        ))}
        <span className="tecla vazia" aria-hidden="true" />
        <button type="button" className="tecla" onClick={() => digitar('0')} disabled={desabilitado}>
          0
        </button>
        <button
          type="button"
          className="tecla"
          aria-label="Apagar"
          onClick={() => !desabilitado && onChange(valor.slice(0, -1))}
          disabled={desabilitado}
        >
          <IconeApagar />
        </button>
      </div>
    </div>
  )
}
