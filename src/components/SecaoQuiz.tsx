'use client'

import { useEffect, useState } from 'react'
import { CONFIG } from '@/lib/config'
import type { Autor, PerguntaQuiz } from '@/lib/tipos'

const json = { 'Content-Type': 'application/json' }
const nomeDe = (a: Autor) => (a === 'ele' ? CONFIG.nomeEle : CONFIG.nomeEla)

function CartaoResponder({
  pergunta,
  onResponder,
}: {
  pergunta: PerguntaQuiz
  onResponder: (id: string, opcao: number) => Promise<void>
}) {
  const [enviando, setEnviando] = useState(false)

  async function escolher(i: number) {
    if (enviando) return
    setEnviando(true)
    await onResponder(pergunta.id, i)
    setEnviando(false)
  }

  return (
    <li className="quiz-cartao">
      <p className="quiz-pergunta">{pergunta.pergunta}</p>
      <div className="quiz-opcoes">
        {pergunta.opcoes.map((op, i) => (
          <button key={i} type="button" className="quiz-opcao" onClick={() => escolher(i)} disabled={enviando}>
            {op}
          </button>
        ))}
      </div>
    </li>
  )
}

function CartaoResultado({ pergunta, minha }: { pergunta: PerguntaQuiz; minha: boolean }) {
  return (
    <li className={`quiz-cartao resultado${pergunta.acertou ? ' acertou' : ' errou'}`}>
      <p className="quiz-pergunta">{pergunta.pergunta}</p>
      <div className="quiz-opcoes">
        {pergunta.opcoes.map((op, i) => (
          <span
            key={i}
            className={`quiz-opcao estatica${i === pergunta.opcaoCorreta ? ' correta' : ''}${
              i === pergunta.opcaoRespondida && i !== pergunta.opcaoCorreta ? ' escolhida-errada' : ''
            }`}
          >
            {op}
          </span>
        ))}
      </div>
      <p className="quiz-status">
        {minha
          ? pergunta.acertou
            ? 'Acertou! 🎉'
            : 'Não acertou desta vez.'
          : pergunta.acertou
            ? 'Você acertou! 🎉'
            : 'Você não acertou desta vez.'}
      </p>
    </li>
  )
}

function CartaoPendenteMinha({ pergunta, onRemover }: { pergunta: PerguntaQuiz; onRemover: (id: string) => void }) {
  return (
    <li className="quiz-cartao">
      <p className="quiz-pergunta">{pergunta.pergunta}</p>
      <p className="quiz-status">Aguardando resposta…</p>
      <button type="button" className="link perigo" onClick={() => onRemover(pergunta.id)}>
        Remover
      </button>
    </li>
  )
}

function FormNovaPergunta({ onCriar, onCancelar }: { onCriar: (p: string, o: string[], c: number) => Promise<boolean>; onCancelar: () => void }) {
  const [pergunta, setPergunta] = useState('')
  const [opcoes, setOpcoes] = useState(['', '', '', ''])
  const [correta, setCorreta] = useState(0)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!pergunta.trim()) return setErro('Escreva a pergunta.')
    if (opcoes.some((o) => !o.trim())) return setErro('Preencha as 4 opções.')
    setOcupado(true)
    setErro('')
    const ok = await onCriar(pergunta, opcoes, correta)
    if (!ok) {
      setErro('Não foi possível guardar. Tente de novo.')
      setOcupado(false)
    }
  }

  return (
    <form className="form" onSubmit={enviar}>
      <textarea className="campo" placeholder="Ex.: Qual foi o primeiro filme que assistimos juntos?" value={pergunta} maxLength={300} onChange={(e) => setPergunta(e.target.value)} aria-label="Pergunta" />
      {opcoes.map((o, i) => (
        <label key={i} className="quiz-linha-opcao">
          <input
            type="radio"
            name="correta"
            checked={correta === i}
            onChange={() => setCorreta(i)}
            aria-label={`Opção ${i + 1} é a correta`}
          />
          <input
            className="campo"
            placeholder={`Opção ${i + 1}${i === correta ? ' (correta)' : ''}`}
            value={o}
            maxLength={150}
            onChange={(e) => setOpcoes((atual) => atual.map((v, j) => (j === i ? e.target.value : v)))}
            aria-label={`Texto da opção ${i + 1}`}
          />
        </label>
      ))}
      <div className="acoes" style={{ marginBottom: 0 }}>
        <button type="submit" className="botao" disabled={ocupado}>
          {ocupado ? 'Guardando…' : 'Criar pergunta'}
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

export default function SecaoQuiz({ autor }: { autor: Autor }) {
  const [perguntas, setPerguntas] = useState<PerguntaQuiz[] | null>(null)
  const [criando, setCriando] = useState(false)
  const [erroCarregar, setErroCarregar] = useState(false)

  async function recarregar() {
    try {
      const r = await fetch(`/api/quiz?para=${autor}`)
      if (!r.ok) throw new Error()
      setPerguntas((await r.json()).perguntas)
      setErroCarregar(false)
    } catch {
      setErroCarregar(true)
    }
  }

  useEffect(() => {
    recarregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autor])

  async function criar(pergunta: string, opcoes: string[], opcaoCorreta: number) {
    try {
      const r = await fetch('/api/quiz', { method: 'POST', headers: json, body: JSON.stringify({ autor, pergunta, opcoes, opcaoCorreta }) })
      if (!r.ok) return false
      setPerguntas((await r.json()).perguntas)
      setCriando(false)
      return true
    } catch {
      return false
    }
  }

  async function responder(id: string, opcaoEscolhida: number) {
    try {
      const r = await fetch(`/api/quiz/${id}/responder`, { method: 'POST', headers: json, body: JSON.stringify({ autor, opcaoEscolhida }) })
      if (r.ok) setPerguntas((await r.json()).perguntas)
      else await recarregar()
    } catch {
      await recarregar()
    }
  }

  async function remover(id: string) {
    if (!window.confirm('Remover esta pergunta?')) return
    const r = await fetch(`/api/quiz/${id}`, { method: 'DELETE', headers: json, body: JSON.stringify({ autor }) })
    if (r.ok) setPerguntas((atual) => (atual ? atual.filter((p) => p.id !== id) : atual))
  }

  if (perguntas === null) {
    return (
      <section className="secao" aria-label="Quiz">
        <h2 className="secao-titulo">Quiz</h2>
        {erroCarregar ? <p className="vazio">Não foi possível carregar o quiz agora.</p> : <p className="vazio">Carregando…</p>}
      </section>
    )
  }

  const nomeOutro = nomeDe(autor === 'ele' ? 'ela' : 'ele')
  const pendentesParaMim = perguntas.filter((p) => p.autorCriador !== autor && !p.respondida)
  const minhasRespondidas = perguntas.filter((p) => p.autorCriador === autor && p.respondida)
  const minhasPendentes = perguntas.filter((p) => p.autorCriador === autor && !p.respondida)
  const respondidasPorMim = perguntas.filter((p) => p.autorCriador !== autor && p.respondida)

  const meusAcertos = respondidasPorMim.filter((p) => p.acertou).length
  const acertosDoOutro = minhasRespondidas.filter((p) => p.acertou).length

  return (
    <section className="secao" aria-label="Quiz">
      <h2 className="secao-titulo">Quiz</h2>
      <p className="secao-sub">O quanto vocês se conhecem?</p>

      {(respondidasPorMim.length > 0 || minhasRespondidas.length > 0) && (
        <div className="quiz-placar">
          {respondidasPorMim.length > 0 && (
            <span>
              Você acertou <strong>{meusAcertos}</strong> de <strong>{respondidasPorMim.length}</strong> pergunta(s) de {nomeOutro}
            </span>
          )}
          {minhasRespondidas.length > 0 && (
            <span>
              {nomeOutro} acertou <strong>{acertosDoOutro}</strong> de <strong>{minhasRespondidas.length}</strong> pergunta(s) suas
            </span>
          )}
        </div>
      )}

      {pendentesParaMim.length > 0 && (
        <>
          <h3 className="quiz-subtitulo">Para você responder</h3>
          <ul className="quiz-lista">
            {pendentesParaMim.map((p) => (
              <CartaoResponder key={p.id} pergunta={p} onResponder={responder} />
            ))}
          </ul>
        </>
      )}

      {!criando && (
        <div className="acoes">
          <button type="button" className="botao" onClick={() => setCriando(true)}>
            + criar pergunta para {nomeOutro}
          </button>
        </div>
      )}
      {criando && <FormNovaPergunta onCriar={criar} onCancelar={() => setCriando(false)} />}

      {minhasPendentes.length > 0 && (
        <>
          <h3 className="quiz-subtitulo">Suas perguntas, aguardando {nomeOutro}</h3>
          <ul className="quiz-lista">
            {minhasPendentes.map((p) => (
              <CartaoPendenteMinha key={p.id} pergunta={p} onRemover={remover} />
            ))}
          </ul>
        </>
      )}

      {(minhasRespondidas.length > 0 || respondidasPorMim.length > 0) && (
        <>
          <h3 className="quiz-subtitulo">Já respondidas</h3>
          <ul className="quiz-lista">
            {[...minhasRespondidas, ...respondidasPorMim]
              .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm))
              .map((p) => (
                <CartaoResultado key={p.id} pergunta={p} minha={p.autorCriador === autor} />
              ))}
          </ul>
        </>
      )}

      {perguntas.length === 0 && !criando && (
        <p className="vazio">Ainda não há perguntas. Crie a primeira para {nomeOutro} responder.</p>
      )}
    </section>
  )
}
