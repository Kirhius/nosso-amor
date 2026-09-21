'use client'

import { useState } from 'react'
import type { Autor, Curiosidade } from '@/lib/tipos'

const json = { 'Content-Type': 'application/json' }

const COLUNAS: { autor: Autor; titulo: string; vazio: string }[] = [
  { autor: 'ele', titulo: 'Sobre ele', vazio: 'Nada por aqui ainda.' },
  { autor: 'ela', titulo: 'Sobre ela', vazio: 'Nada por aqui ainda.' },
]

export default function SecaoCuriosidades({ inicial }: { inicial: Curiosidade[] }) {
  const [itens, setItens] = useState<Curiosidade[]>(inicial)
  const [aberto, setAberto] = useState<Autor | null>(null)
  const [texto, setTexto] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')

  function alternar(autor: Autor) {
    setTexto('')
    setErro('')
    setAberto((atual) => (atual === autor ? null : autor))
  }

  async function salvar(e: React.FormEvent, autor: Autor) {
    e.preventDefault()
    if (!texto.trim()) {
      setErro('Escreva algo.')
      return
    }
    setOcupado(true)
    setErro('')
    try {
      const r = await fetch('/api/curiosidades', { method: 'POST', headers: json, body: JSON.stringify({ texto, autor }) })
      if (!r.ok) throw new Error()
      const d = await r.json()
      setItens(d.curiosidades)
      setTexto('')
      setAberto(null)
    } catch {
      setErro('Não foi possível guardar. Tente de novo.')
    }
    setOcupado(false)
  }

  async function remover(c: Curiosidade) {
    if (!window.confirm('Remover esta curiosidade?')) return
    const r = await fetch(`/api/curiosidades/${c.id}`, { method: 'DELETE' })
    if (r.ok) setItens((lista) => lista.filter((x) => x.id !== c.id))
  }

  return (
    <section className="secao" aria-label="Curiosidades">
      <h2 className="secao-titulo">Curiosidades</h2>
      <p className="secao-sub">Pequenas coisas que só vocês dois sabem.</p>

      <div className="colunas-curiosidades">
        {COLUNAS.map(({ autor, titulo, vazio }) => {
          const daColuna = itens.filter((i) => i.autor === autor)
          const formAberto = aberto === autor
          return (
            <div key={autor} className="coluna-curiosidades">
              <h3>{titulo}</h3>

              <div className="acoes">
                <button type="button" className="botao-suave" onClick={() => alternar(autor)} aria-expanded={formAberto}>
                  {formAberto ? 'Cancelar' : '+ adicionar'}
                </button>
              </div>

              {formAberto && (
                <form className="form" onSubmit={(e) => salvar(e, autor)}>
                  <textarea
                    className="campo"
                    placeholder={autor === 'ele' ? 'Algo sobre ele…' : 'Algo sobre ela…'}
                    value={texto}
                    maxLength={1000}
                    autoFocus
                    onChange={(e) => setTexto(e.target.value)}
                    aria-label={titulo}
                  />
                  <button type="submit" className="botao" disabled={ocupado}>
                    {ocupado ? 'Guardando…' : 'Guardar'}
                  </button>
                  <p className="aviso erro" role="status">
                    {erro}
                  </p>
                </form>
              )}

              {daColuna.length === 0 ? (
                !formAberto && <p className="vazio">{vazio}</p>
              ) : (
                <ul className="lista-curiosidades">
                  {daColuna.map((c) => (
                    <li key={c.id}>
                      <p>{c.texto}</p>
                      <button type="button" className="link perigo" onClick={() => remover(c)}>
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
