'use client'

import { useState } from 'react'
import type { Momento } from '@/lib/tipos'
import { Coracao } from './Icones'

const json = { 'Content-Type': 'application/json' }
const hojeBrasilia = () => new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10)
const formatar = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

type Dados = { titulo: string; data: string; descricao: string }

function FormMomento({
  inicial,
  rotulo,
  onSalvar,
  onCancelar,
}: {
  inicial: Dados
  rotulo: string
  onSalvar: (d: Dados) => Promise<boolean>
  onCancelar: () => void
}) {
  const [titulo, setTitulo] = useState(inicial.titulo)
  const [data, setData] = useState(inicial.data)
  const [descricao, setDescricao] = useState(inicial.descricao)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) {
      setErro('Dê um título ao momento.')
      return
    }
    setOcupado(true)
    setErro('')
    const ok = await onSalvar({ titulo, data, descricao })
    if (!ok) {
      setErro('Não foi possível guardar. Tente de novo.')
      setOcupado(false)
    }
  }

  return (
    <form className="form" onSubmit={enviar}>
      <input className="campo" placeholder="O que aconteceu?" value={titulo} maxLength={120} onChange={(e) => setTitulo(e.target.value)} aria-label="Título" />
      <input className="campo" type="date" value={data} onChange={(e) => setData(e.target.value)} aria-label="Data" required />
      <textarea className="campo" placeholder="Conte como foi (opcional)" value={descricao} maxLength={2000} onChange={(e) => setDescricao(e.target.value)} aria-label="Descrição" />
      <div className="acoes" style={{ marginBottom: 0 }}>
        <button type="submit" className="botao" disabled={ocupado}>
          {ocupado ? 'Guardando…' : rotulo}
        </button>
        <button type="button" className="botao-suave" onClick={onCancelar} disabled={ocupado}>
          Cancelar
        </button>
      </div>
      <p className="aviso erro" role="status">
        {erro}
      </p>
    </form>
  )
}

export default function SecaoMomentos({ inicial }: { inicial: Momento[] }) {
  const [momentos, setMomentos] = useState<Momento[]>(inicial)
  const [adicionando, setAdicionando] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)

  async function criar(d: Dados) {
    try {
      const r = await fetch('/api/momentos', { method: 'POST', headers: json, body: JSON.stringify(d) })
      if (!r.ok) return false
      setMomentos((await r.json()).momentos)
      setAdicionando(false)
      return true
    } catch {
      return false
    }
  }

  async function editar(id: string, d: Dados) {
    try {
      const r = await fetch(`/api/momentos/${id}`, { method: 'PATCH', headers: json, body: JSON.stringify(d) })
      if (!r.ok) return false
      setMomentos((await r.json()).momentos)
      setEditandoId(null)
      return true
    } catch {
      return false
    }
  }

  async function remover(m: Momento) {
    if (!window.confirm(`Remover “${m.titulo}”?`)) return
    const r = await fetch(`/api/momentos/${m.id}`, { method: 'DELETE' })
    if (r.ok) setMomentos((atual) => atual.filter((x) => x.id !== m.id))
  }

  return (
    <section className="secao" aria-label="Momentos marcantes">
      <h2 className="secao-titulo">Momentos marcantes</h2>
      <p className="secao-sub">A nossa história, do mais recente ao mais antigo.</p>

      {!adicionando && (
        <div className="acoes">
          <button
            type="button"
            className="botao"
            onClick={() => {
              setEditandoId(null)
              setAdicionando(true)
            }}
          >
            Guardar um momento
          </button>
        </div>
      )}

      {adicionando && (
        <FormMomento
          inicial={{ titulo: '', data: hojeBrasilia(), descricao: '' }}
          rotulo="Guardar momento"
          onSalvar={criar}
          onCancelar={() => setAdicionando(false)}
        />
      )}

      {momentos.length === 0 ? (
        <p className="vazio">Ainda não há momentos. Que tal começar pelo primeiro encontro?</p>
      ) : (
        <ol className="trilha">
          {momentos.map((m) => (
            <li key={m.id}>
              <Coracao cheio className="marca" />
              {editandoId === m.id ? (
                <FormMomento
                  inicial={{ titulo: m.titulo, data: m.data, descricao: m.descricao }}
                  rotulo="Salvar alterações"
                  onSalvar={(d) => editar(m.id, d)}
                  onCancelar={() => setEditandoId(null)}
                />
              ) : (
                <>
                  <div className="data">{formatar(m.data)}</div>
                  <h3>{m.titulo}</h3>
                  {m.descricao && <p>{m.descricao}</p>}
                  <div className="acoes-item">
                    <button
                      type="button"
                      className="link"
                      onClick={() => {
                        setAdicionando(false)
                        setEditandoId(m.id)
                      }}
                    >
                      Editar
                    </button>
                    <button type="button" className="link perigo" onClick={() => remover(m)}>
                      Remover
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
