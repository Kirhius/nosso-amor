'use client'

import { useState } from 'react'
import type { Momento } from '@/lib/tipos'
import { Coracao } from './Icones'

const json = { 'Content-Type': 'application/json' }
const hojeBrasilia = () => new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10)
const formatar = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

export default function SecaoMomentos({ inicial }: { inicial: Momento[] }) {
  const [momentos, setMomentos] = useState<Momento[]>(inicial)
  const [formAberto, setFormAberto] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [data, setData] = useState(hojeBrasilia())
  const [descricao, setDescricao] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) {
      setErro('Dê um título ao momento.')
      return
    }
    setOcupado(true)
    setErro('')
    try {
      const r = await fetch('/api/momentos', { method: 'POST', headers: json, body: JSON.stringify({ titulo, data, descricao }) })
      if (!r.ok) throw new Error()
      const d = await r.json()
      setMomentos(d.momentos)
      setTitulo('')
      setDescricao('')
      setFormAberto(false)
    } catch {
      setErro('Não foi possível guardar o momento. Tente de novo.')
    }
    setOcupado(false)
  }

  async function remover(m: Momento) {
    if (!window.confirm(`Remover “${m.titulo}”?`)) return
    const r = await fetch(`/api/momentos/${m.id}`, { method: 'DELETE' })
    if (r.ok) setMomentos((atual) => atual.filter((x) => x.id !== m.id))
  }

  return (
    <section className="secao" aria-label="Momentos marcantes">
      <h2 className="secao-titulo">Momentos marcantes</h2>
      <p className="secao-sub">A nossa história, dia após dia.</p>

      <div className="acoes">
        <button type="button" className="botao" onClick={() => setFormAberto((v) => !v)} aria-expanded={formAberto}>
          {formAberto ? 'Cancelar' : 'Guardar um momento'}
        </button>
      </div>

      {formAberto && (
        <form className="form" onSubmit={salvar}>
          <input className="campo" placeholder="O que aconteceu?" value={titulo} maxLength={120} onChange={(e) => setTitulo(e.target.value)} aria-label="Título" />
          <input className="campo" type="date" value={data} onChange={(e) => setData(e.target.value)} aria-label="Data" required />
          <textarea className="campo" placeholder="Conte como foi (opcional)" value={descricao} maxLength={2000} onChange={(e) => setDescricao(e.target.value)} aria-label="Descrição" />
          <button type="submit" className="botao" disabled={ocupado}>
            {ocupado ? 'Guardando…' : 'Guardar momento'}
          </button>
          <p className="aviso erro" role="status">
            {erro}
          </p>
        </form>
      )}

      {momentos.length === 0 ? (
        <p className="vazio">Ainda não há momentos. Que tal começar pelo primeiro encontro?</p>
      ) : (
        <ol className="trilha">
          {momentos.map((m) => (
            <li key={m.id}>
              <Coracao cheio className="marca" />
              <div className="data">{formatar(m.data)}</div>
              <h3>{m.titulo}</h3>
              {m.descricao && <p>{m.descricao}</p>}
              <button type="button" className="link perigo" onClick={() => remover(m)}>
                Remover
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
