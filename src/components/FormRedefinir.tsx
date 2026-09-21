'use client'

import { useCallback, useEffect, useState } from 'react'
import Cabecalho from './Cabecalho'
import TecladoPin from './TecladoPin'

export default function FormRedefinir({ token }: { token: string }) {
  const [etapa, setEtapa] = useState<'novo' | 'confirmar'>('novo')
  const [primeiro, setPrimeiro] = useState('')
  const [pin, setPin] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [tremer, setTremer] = useState(false)
  const [msg, setMsg] = useState<{ texto: string; erro: boolean } | null>(null)
  const [invalido, setInvalido] = useState(false)

  const salvar = useCallback(
    async (valor: string) => {
      setOcupado(true)
      setMsg(null)
      try {
        const r = await fetch('/api/pin/redefinir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, pin: valor }),
        })
        const d = await r.json().catch(() => ({}))
        if (r.ok) {
          window.location.assign('/')
          return
        }
        if (d.erro === 'token_invalido') setInvalido(true)
        else setMsg({ texto: 'Não foi possível salvar o PIN. Tente de novo.', erro: true })
      } catch {
        setMsg({ texto: 'Sem conexão. Verifique a internet e tente de novo.', erro: true })
      }
      setPin('')
      setPrimeiro('')
      setEtapa('novo')
      setOcupado(false)
    },
    [token],
  )

  useEffect(() => {
    if (pin.length !== 4) return
    if (etapa === 'novo') {
      setPrimeiro(pin)
      setPin('')
      setEtapa('confirmar')
    } else if (pin !== primeiro) {
      setMsg({ texto: 'Os dois PINs não são iguais. Escolha de novo.', erro: true })
      setTremer(true)
      setTimeout(() => setTremer(false), 450)
      setPin('')
      setPrimeiro('')
      setEtapa('novo')
    } else {
      salvar(pin)
    }
  }, [pin, etapa, primeiro, salvar])

  return (
    <main className="tela">
      <Cabecalho />
      <div className="cartao-pin">
        {invalido ? (
          <>
            <p className="instrucao">Este link expirou ou já foi usado.</p>
            <a className="botao" href="/">
              Voltar e pedir outro link
            </a>
          </>
        ) : (
          <>
            <p className="instrucao">
              {etapa === 'novo' ? 'Escolha o novo PIN de 4 dígitos' : 'Digite o mesmo PIN mais uma vez'}
            </p>
            <TecladoPin
              key={etapa}
              valor={pin}
              onChange={(v) => {
                setMsg(null)
                setPin(v)
              }}
              desabilitado={ocupado}
              tremer={tremer}
            />
            <p className={`aviso${msg?.erro ? ' erro' : ''}`} role="status">
              {msg?.texto}
            </p>
          </>
        )}
      </div>
    </main>
  )
}
