'use client'

import { useEffect, useState } from 'react'

type Estado = 'carregando' | 'sem-chave' | 'sem-suporte' | 'instalar-ios' | 'pedir' | 'ativo' | 'negado'

const CHAVE_PUBLICA = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

function chaveParaBytes(base64: string): BufferSource {
  const preenchida = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const bruto = atob(preenchida)
  const bytes = new Uint8Array(bruto.length)
  for (let i = 0; i < bruto.length; i++) bytes[i] = bruto.charCodeAt(i)
  return bytes as unknown as BufferSource
}

export default function BotaoNotificacoes() {
  const [estado, setEstado] = useState<Estado>('carregando')
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    let cancelado = false
    ;(async () => {
      const definir = (e: Estado) => !cancelado && setEstado(e)
      if (!CHAVE_PUBLICA) return definir('sem-chave')

      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      const instalado =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true
      if (ios && !instalado) return definir('instalar-ios')

      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        return definir('sem-suporte')
      }
      if (Notification.permission === 'denied') return definir('negado')

      try {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        definir(sub && Notification.permission === 'granted' ? 'ativo' : 'pedir')
      } catch {
        definir('sem-suporte')
      }
    })()
    return () => {
      cancelado = true
    }
  }, [])

  async function ativar() {
    setAviso('')
    try {
      const permissao = await Notification.requestPermission()
      if (permissao !== 'granted') {
        setEstado(permissao === 'denied' ? 'negado' : 'pedir')
        return
      }
      const reg = await navigator.serviceWorker.ready
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: chaveParaBytes(CHAVE_PUBLICA!) }))
      const r = await fetch('/api/push/inscrever', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })
      if (!r.ok) throw new Error()
      setEstado('ativo')
    } catch {
      setAviso('Não foi possível ativar os avisos neste aparelho.')
    }
  }

  async function testar() {
    setAviso('')
    const r = await fetch('/api/push/teste', { method: 'POST' })
    const d = await r.json().catch(() => ({}))
    if (!r.ok) setAviso(d.detalhe ? `Configuração pendente: ${d.detalhe}` : 'Não foi possível enviar o teste.')
    else setAviso(d.enviados > 0 ? 'Teste enviado. Ele deve chegar em instantes.' : 'Nenhum aparelho recebeu o teste.')
  }

  if (estado === 'carregando') return null

  return (
    <div style={{ textAlign: 'center' }}>
      {estado === 'pedir' && (
        <button type="button" className="botao-suave" onClick={ativar}>
          Ativar avisos de aniversário
        </button>
      )}
      {estado === 'ativo' && (
        <span>
          Avisos ativos neste aparelho.{' '}
          <button type="button" className="link" onClick={testar}>
            Enviar teste
          </button>
        </span>
      )}
      {estado === 'instalar-ios' && (
        <p className="vazio" style={{ padding: 0 }}>
          Para receber avisos no iPhone, toque em Compartilhar, depois em Adicionar à Tela de Início, e abra o app por lá.
        </p>
      )}
      {estado === 'negado' && (
        <p className="vazio" style={{ padding: 0 }}>
          Os avisos estão bloqueados. Libere nas configurações do aparelho.
        </p>
      )}
      {estado === 'sem-suporte' && (
        <p className="vazio" style={{ padding: 0 }}>
          Este navegador não recebe avisos.
        </p>
      )}
      {estado === 'sem-chave' && (
        <p className="vazio" style={{ padding: 0 }}>
          Avisos ainda não configurados (chaves VAPID).
        </p>
      )}
      {aviso && (
        <p className="aviso" role="status">
          {aviso}
        </p>
      )}
    </div>
  )
}
