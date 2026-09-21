'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cabecalho from './Cabecalho'
import TecladoPin from './TecladoPin'

type Mensagem = { texto: string; erro: boolean }

export default function TelaPin({ temPin }: { temPin: boolean }) {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [tremer, setTremer] = useState(false)
  const [msg, setMsg] = useState<Mensagem | null>(null)

  const entrar = useCallback(
    async (valor: string) => {
      setOcupado(true)
      setMsg(null)
      let entrou = false
      try {
        const r = await fetch('/api/pin/entrar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: valor }),
        })
        const d = await r.json().catch(() => ({}))
        if (r.ok) {
          entrou = true
          router.refresh()
          return
        }
        setPin('')
        setTremer(true)
        setTimeout(() => setTremer(false), 450)
        if (d.erro === 'bloqueado') {
          setMsg({ texto: `Muitas tentativas. Tente de novo em ${d.minutos} min ou peça um link em “Esqueci o PIN”.`, erro: true })
        } else if (d.erro === 'pin_incorreto') {
          setMsg({
            texto:
              d.restantes > 0
                ? `PIN incorreto. Restam ${d.restantes} ${d.restantes === 1 ? 'tentativa' : 'tentativas'}.`
                : 'PIN incorreto. O acesso ficou bloqueado por 15 minutos.',
            erro: true,
          })
        } else if (d.detalhe) {
          setMsg({ texto: `Configuração pendente: ${d.detalhe}`, erro: true })
        } else {
          setMsg({ texto: 'Não foi possível entrar agora. Tente de novo.', erro: true })
        }
      } catch {
        setPin('')
        setMsg({ texto: 'Sem conexão. Verifique a internet e tente de novo.', erro: true })
      } finally {
        if (!entrou) setOcupado(false)
      }
    },
    [router],
  )

  useEffect(() => {
    if (pin.length === 4) entrar(pin)
  }, [pin, entrar])

  async function esqueci() {
    setOcupado(true)
    setMsg(null)
    try {
      const r = await fetch('/api/pin/esqueci', { method: 'POST' })
      const d = await r.json().catch(() => ({}))
      if (r.ok) setMsg({ texto: `Enviamos um link para ${d.email}. Ele vale por 30 minutos.`, erro: false })
      else if (d.erro === 'aguarde') setMsg({ texto: 'Um e-mail já foi enviado há pouco. Espere 2 minutos para pedir outro.', erro: true })
      else if (d.erro === 'sem_email') setMsg({ texto: 'O e-mail de recuperação não está configurado (EMAIL_RECUPERACAO).', erro: true })
      else if (d.detalhe) setMsg({ texto: `Configuração pendente: ${d.detalhe}`, erro: true })
      else setMsg({ texto: 'Não foi possível enviar o e-mail. Verifique a configuração do Resend.', erro: true })
    } catch {
      setMsg({ texto: 'Sem conexão. Verifique a internet e tente de novo.', erro: true })
    } finally {
      setOcupado(false)
    }
  }

  return (
    <main className="tela">
      <Cabecalho />
      <div className="cartao-pin">
        {temPin ? (
          <>
            <p className="instrucao">Digite o PIN de vocês dois</p>
            <TecladoPin valor={pin} onChange={setPin} desabilitado={ocupado} tremer={tremer} />
            <p className={`aviso${msg?.erro ? ' erro' : ''}`} role="status">
              {msg?.texto}
            </p>
            <button type="button" className="link" onClick={esqueci} disabled={ocupado}>
              Esqueci o PIN
            </button>
          </>
        ) : (
          <>
            <p className="instrucao">
              Ainda não existe um PIN. Enviaremos um link para o e-mail cadastrado, e por ele vocês criam o PIN.
            </p>
            <button type="button" className="botao" onClick={esqueci} disabled={ocupado}>
              Enviar link para criar o PIN
            </button>
            <p className={`aviso${msg?.erro ? ' erro' : ''}`} role="status">
              {msg?.texto}
            </p>
          </>
        )}
      </div>
    </main>
  )
}
