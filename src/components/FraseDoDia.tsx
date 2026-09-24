'use client'

import { useEffect, useState } from 'react'
import { fraseDoDia, type Frase } from '@/lib/frases'
import { Coracao } from './Icones'

export default function FraseDoDia() {
  const [frase, setFrase] = useState<Frase | null>(null)

  useEffect(() => setFrase(fraseDoDia()), [])

  if (!frase) return null

  return (
    <div className="frase-dia">
      <span className="frase-dia-coracao" aria-hidden="true">
        <Coracao cheio />
      </span>
      <p>"{frase.texto}"</p>
      <span>{frase.fonte}</span>
    </div>
  )
}
