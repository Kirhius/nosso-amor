'use client'

import { useState } from 'react'
import { CONFIG } from '@/lib/config'
import type { Autor, Bilhete } from '@/lib/tipos'

const json = { 'Content-Type': 'application/json' }
const nomeDe = (a: Autor) => (a === 'ele' ? CONFIG.nomeEle : CONFIG.nomeEla)

function formatar(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

type Dados = { de: Autor; para: Autor; texto: string }

function SeletorAutor({ rotulo, valor, onEscolher }: { rotulo: string; valor: Autor; onEscolher: (a: Autor) => void }) {
  return (
    <div className="seletor-de-para">
      <span className="seletor-rotulo">{rotulo}</span>
      <div className="seletor-botoes">
        {(['ele', 'ela'] as Autor[]).map((a) => (
          <button
            key={a}
            type="button"
            className={`seletor-botao${valor === a ? ' selecionado' : ''}`}
            onClick={() => onEscolher(a)}
          >
            {nomeDe(a)}
          </button>
        ))}
      </div>
    </div>
  )
}

function FormBilhete({
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
  const [de, setDe] = useState<Autor>(inicial.de)
  const [para, setPara] = useState<Autor>(inicial.para)
  const [texto, setTexto] = useState(inicial.texto)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!texto.trim()) return setErro('Escreva o bilhete.')
    setOcupado(true)
    setErro('')
    const ok = await onSalvar({ de, para, texto })
    if (!ok) {
      setErro('Não foi possível guardar. Tente de novo.')
      setOcupado(false)
    }
  }

  return (
    <form className="form" onSubmit={enviar}>
      <SeletorAutor rotulo="De:" valor={de} onEscolher={setDe} />
      <SeletorAutor rotulo="Para:" valor={para} onEscolher={setPara} />
      <textarea
        className="campo"
        placeholder="Escreva seu bilhete…"
        value={texto}
        maxLength={1000}
        autoFocus
        onChange={(e) => setTexto(e.target.value)}
        aria-label="Texto do bilhete"
      />
      <div className="acoes" style={{ marginBottom: 0 }}>
        <button type="submit" className="botao" disabled={ocupado}>
          {ocupado ? 'Postando…' : rotulo}
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

export default function SecaoBilhetes({ inicial, autor }: { inicial: Bilhete[]; autor: Autor }) {
  const [bilhetes, setBilhetes] = useState<Bilhete[]>(inicial)
  const [adicionando, setAdicionando] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)

  async function criar(d: Dados) {
    try {
      const r = await fetch('/api/bilhetes', { method: 'POST', headers: json, body: JSON.stringify(d) })
      if (!r.ok) return false
      setBilhetes((await r.json()).bilhetes)
      setAdicionando(false)
      return true
    } catch {
      return false
    }
  }

  async function editar(id: string, d: Dados) {
    try {
      const r = await fetch(`/api/bilhetes/${id}`, { method: 'PATCH', headers: json, body: JSON.stringify(d) })
      if (!r.ok) return false
      setBilhetes((await r.json()).bilhetes)
      setEditandoId(null)
      return true
    } catch {
      return false
    }
  }

  async function remover(b: Bilhete) {
    if (!window.confirm('Remover este bilhete?')) return
    const r = await fetch(`/api/bilhetes/${b.id}`, { method: 'DELETE' })
    if (r.ok) setBilhetes((atual) => atual.filter((x) => x.id !== b.id))
  }

  return (
    <section className="secao" aria-label="Bilhetes">
      <h2 className="secao-titulo">Bilhetes</h2>
      <p className="secao-sub">Recadinhos de um para o outro.</p>

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
            + novo bilhete
          </button>
        </div>
      )}

      {adicionando && (
        <FormBilhete
          inicial={{ de: autor, para: autor === 'ele' ? 'ela' : 'ele', texto: '' }}
          rotulo="Postar"
          onSalvar={criar}
          onCancelar={() => setAdicionando(false)}
        />
      )}

      {bilhetes.length === 0 ? (
        <p className="vazio">Ainda não há bilhetes. Que tal deixar o primeiro recadinho?</p>
      ) : (
        <div className="feed-bilhetes">
          {bilhetes.map((b) =>
            editandoId === b.id ? (
              <div key={b.id} className="post-it editando">
                <FormBilhete
                  inicial={{ de: b.de, para: b.para, texto: b.texto }}
                  rotulo="Salvar alterações"
                  onSalvar={(d) => editar(b.id, d)}
                  onCancelar={() => setEditandoId(null)}
                />
              </div>
            ) : (
              <div key={b.id} className="post-it">
                <div className="post-it-cabecalho">
                  <span>
                    De: <strong>{nomeDe(b.de)}</strong>
                  </span>
                  <span>
                    Para: <strong>{nomeDe(b.para)}</strong>
                  </span>
                </div>
                <p className="post-it-texto">{b.texto}</p>
                <div className="post-it-rodape">
                  <span className="post-it-data">
                    {formatar(b.criadoEm)}
                    {b.editadoEm && ' · editado'}
                  </span>
                  <div className="acoes-item">
                    <button
                      type="button"
                      className="link"
                      onClick={() => {
                        setAdicionando(false)
                        setEditandoId(b.id)
                      }}
                    >
                      Editar
                    </button>
                    <button type="button" className="link perigo" onClick={() => remover(b)}>
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </section>
  )
}
