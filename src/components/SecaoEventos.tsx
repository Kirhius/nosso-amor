'use client'

import { useEffect, useState } from 'react'
import type { Evento, TipoEvento } from '@/lib/tipos'
import {
  IconeChurrasco,
  IconeEstrela,
  IconeJantar,
  IconeMala,
  IconeMicrofone,
  IconePasseio,
} from './Icones'

const json = { 'Content-Type': 'application/json' }
const hojeBrasilia = () => new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10)
const formatar = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

const TIPOS: { valor: TipoEvento; rotulo: string; Icone: React.ComponentType }[] = [
  { valor: 'viagem', rotulo: 'Viagem', Icone: IconeMala },
  { valor: 'show', rotulo: 'Show', Icone: IconeMicrofone },
  { valor: 'passeio', rotulo: 'Passeio', Icone: IconePasseio },
  { valor: 'churrasco', rotulo: 'Churrasco', Icone: IconeChurrasco },
  { valor: 'jantar', rotulo: 'Jantar', Icone: IconeJantar },
  { valor: 'outro', rotulo: 'Outro', Icone: IconeEstrela },
]
const iconeDe = (tipo: TipoEvento) => TIPOS.find((t) => t.valor === tipo)?.Icone ?? IconeEstrela

function diasRestantes(dataISO: string): number {
  const hojeBrt = new Date(Date.now() - 3 * 3600_000)
  const hojeUTC = Date.UTC(hojeBrt.getUTCFullYear(), hojeBrt.getUTCMonth(), hojeBrt.getUTCDate())
  const [a, m, d] = dataISO.split('-').map(Number)
  const alvoUTC = Date.UTC(a, m - 1, d)
  return Math.round((alvoUTC - hojeUTC) / 86400000)
}

function rotuloContagem(dias: number): string {
  if (dias === 0) return 'É hoje! ❤️'
  if (dias === 1) return 'Falta 1 dia'
  if (dias > 1) return `Faltam ${dias} dias`
  if (dias === -1) return 'Foi ontem'
  return `Foi há ${Math.abs(dias)} dias`
}

type Dados = { titulo: string; tipo: TipoEvento; data: string; observacao: string }

function FormEvento({
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
  const [tipo, setTipo] = useState<TipoEvento>(inicial.tipo)
  const [data, setData] = useState(inicial.data)
  const [observacao, setObservacao] = useState(inicial.observacao)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) {
      setErro('Dê um nome ao evento.')
      return
    }
    setOcupado(true)
    setErro('')
    const ok = await onSalvar({ titulo, tipo, data, observacao })
    if (!ok) {
      setErro('Não foi possível guardar. Tente de novo.')
      setOcupado(false)
    }
  }

  return (
    <form className="form" onSubmit={enviar}>
      <input className="campo" placeholder="Nome do evento" value={titulo} maxLength={120} onChange={(e) => setTitulo(e.target.value)} aria-label="Nome do evento" />

      <div className="seletor-tipos" role="radiogroup" aria-label="Tipo de evento">
        {TIPOS.map(({ valor, rotulo: r, Icone }) => (
          <button
            key={valor}
            type="button"
            role="radio"
            aria-checked={tipo === valor}
            className={`tipo-evento${tipo === valor ? ' selecionado' : ''}`}
            onClick={() => setTipo(valor)}
          >
            <Icone />
            <span>{r}</span>
          </button>
        ))}
      </div>

      <input className="campo" type="date" value={data} onChange={(e) => setData(e.target.value)} aria-label="Data" required />
      <textarea
        className="campo"
        placeholder="Observação (opcional): levar algo, reservar, comprar…"
        value={observacao}
        maxLength={500}
        onChange={(e) => setObservacao(e.target.value)}
        aria-label="Observação"
      />
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

export default function SecaoEventos({ inicial }: { inicial: Evento[] }) {
  const [eventos, setEventos] = useState<Evento[]>(inicial)
  const [adicionando, setAdicionando] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [, forcar] = useState(0)

  // Atualiza a contagem de dias a cada hora, sem precisar recarregar a pagina.
  useEffect(() => {
    const id = setInterval(() => forcar((n) => n + 1), 3600_000)
    return () => clearInterval(id)
  }, [])

  async function criar(d: Dados) {
    try {
      const r = await fetch('/api/eventos', { method: 'POST', headers: json, body: JSON.stringify(d) })
      if (!r.ok) return false
      setEventos((await r.json()).eventos)
      setAdicionando(false)
      return true
    } catch {
      return false
    }
  }

  async function editar(id: string, d: Dados) {
    try {
      const r = await fetch(`/api/eventos/${id}`, { method: 'PATCH', headers: json, body: JSON.stringify(d) })
      if (!r.ok) return false
      setEventos((await r.json()).eventos)
      setEditandoId(null)
      return true
    } catch {
      return false
    }
  }

  async function remover(ev: Evento) {
    if (!window.confirm(`Remover “${ev.titulo}”?`)) return
    const r = await fetch(`/api/eventos/${ev.id}`, { method: 'DELETE' })
    if (r.ok) setEventos((atual) => atual.filter((x) => x.id !== ev.id))
  }

  const ordenados = [...eventos].sort((a, b) => diasRestantes(a.data) - diasRestantes(b.data))

  return (
    <section className="secao" aria-label="Eventos">
      <h2 className="secao-titulo">Eventos</h2>
      <p className="secao-sub">O que ainda está por vir, e o que já aconteceu.</p>

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
        <FormEvento
          inicial={{ titulo: '', tipo: 'passeio', data: hojeBrasilia(), observacao: '' }}
          rotulo="Guardar evento"
          onSalvar={criar}
          onCancelar={() => setAdicionando(false)}
        />
      )}

      {ordenados.length === 0 ? (
        <p className="vazio">Ainda não há eventos marcados. Que tal a próxima viagem ou um jantar especial?</p>
      ) : (
        <ul className="lista-eventos">
          {ordenados.map((ev) => {
            const Icone = iconeDe(ev.tipo)
            const dias = diasRestantes(ev.data)
            return (
              <li key={ev.id} className={dias < 0 ? 'passado' : undefined}>
                {editandoId === ev.id ? (
                  <FormEvento
                    inicial={{ titulo: ev.titulo, tipo: ev.tipo, data: ev.data, observacao: ev.observacao }}
                    rotulo="Salvar alterações"
                    onSalvar={(d) => editar(ev.id, d)}
                    onCancelar={() => setEditandoId(null)}
                  />
                ) : (
                  <div className="evento">
                    <span className="evento-icone">
                      <Icone />
                    </span>
                    <div className="evento-texto">
                      <h3>{ev.titulo}</h3>
                      <div className="data">{formatar(ev.data)}</div>
                      <div className="contagem">{rotuloContagem(dias)}</div>
                      {ev.observacao && <p className="observacao">{ev.observacao}</p>}
                      <div className="acoes-item">
                        <button
                          type="button"
                          className="link"
                          onClick={() => {
                            setAdicionando(false)
                            setEditandoId(ev.id)
                          }}
                        >
                          Editar
                        </button>
                        <button type="button" className="link perigo" onClick={() => remover(ev)}>
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
