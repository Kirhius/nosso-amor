'use client'

import { useEffect, useState } from 'react'
import { fraseDoDia, type Frase } from '@/lib/frases'

export default function FraseDoDia() {
  const [frase, setFrase] = useState<Frase | null>(null)

  useEffect(() => setFrase(fraseDoDia()), [])

  if (!frase) return null

  return (
    <div className="frase-dia">
      <p>"{frase.texto}"</p>
      <span>{frase.fonte}</span>
    </div>
  )
}
