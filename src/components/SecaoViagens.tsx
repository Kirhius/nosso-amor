'use client'

import { useState } from 'react'
import type { Viagem } from '@/lib/tipos'
import { IconePin } from './Icones'

const json = { 'Content-Type': 'application/json' }
const hojeBrasilia = () => new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10)
const formatar = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

type Dados = { local: string; data: string }

function FormViagem({
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
  const [local, setLocal] = useState(inicial.local)
  const [data, setData] = useState(inicial.data)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!local.trim()) {
      setErro('Escreva o local da viagem.')
      return
    }
    setOcupado(true)
    setErro('')
    const ok = await onSalvar({ local, data })
    if (!ok) {
      setErro('Não foi possível guardar. Tente de novo.')
      setOcupado(false)
    }
  }

  return (
    <form className="form" onSubmit={enviar}>
      <input className="campo" placeholder="Para onde vocês foram?" value={local} maxLength={150} autoFocus onChange={(e) => setLocal(e.target.value)} aria-label="Local" />
      <input className="campo" type="date" value={data} onChange={(e) => setData(e.target.value)} aria-label="Data" required />
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

export default function SecaoViagens({ inicial }: { inicial: Viagem[] }) {
  const [viagens, setViagens] = useState<Viagem[]>(inicial)
  const [adicionando, setAdicionando] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)

  async function criar(d: Dados) {
    try {
      const r = await fetch('/api/viagens', { method: 'POST', headers: json, body: JSON.stringify(d) })
      if (!r.ok) return false
      setViagens((await r.json()).viagens)
      setAdicionando(false)
      return true
    } catch {
      return false
    }
  }

  async function editar(id: string, d: Dados) {
    try {
      const r = await fetch(`/api/viagens/${id}`, { method: 'PATCH', headers: json, body: JSON.stringify(d) })
      if (!r.ok) return false
      setViagens((await r.json()).viagens)
      setEditandoId(null)
      return true
    } catch {
      return false
    }
  }

  async function remover(v: Viagem) {
    if (!window.confirm(`Remover a viagem para ${v.local}?`)) return
    const r = await fetch(`/api/viagens/${v.id}`, { method: 'DELETE' })
    if (r.ok) setViagens((atual) => atual.filter((x) => x.id !== v.id))
  }

  return (
    <section className="secao" aria-label="Viagens">
      <h2 className="secao-titulo">Viagens</h2>
      <p className="secao-sub">Os lugares que já conhecemos juntos.</p>

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
            + adicionar
          </button>
        </div>
      )}

      {adicionando && (
        <FormViagem
          inicial={{ local: '', data: hojeBrasilia() }}
          rotulo="Guardar viagem"
          onSalvar={criar}
          onCancelar={() => setAdicionando(false)}
        />
      )}

      {viagens.length === 0 ? (
        <p className="vazio">Ainda não há viagens. Qual foi o primeiro lugar que vocês visitaram juntos?</p>
      ) : (
        <ul className="lista-viagens">
          {viagens.map((v) => (
            <li key={v.id}>
              {editandoId === v.id ? (
                <FormViagem
                  inicial={{ local: v.local, data: v.data }}
                  rotulo="Salvar alterações"
                  onSalvar={(d) => editar(v.id, d)}
                  onCancelar={() => setEditandoId(null)}
                />
              ) : (
                <div className="viagem">
                  <span className="viagem-icone">
                    <IconePin />
                  </span>
                  <div className="viagem-texto">
                    <h3>{v.local}</h3>
                    <div className="data">{formatar(v.data)}</div>
                    <div className="acoes-item">
                      <button
                        type="button"
                        className="link"
                        onClick={() => {
                          setAdicionando(false)
                          setEditandoId(v.id)
                        }}
                      >
                        Editar
                      </button>
                      <button type="button" className="link perigo" onClick={() => remover(v)}>
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
