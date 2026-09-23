'use client'

import { useEffect, useState } from 'react'
import type { Autor } from '@/lib/tipos'
import { IconeSino } from './Icones'

type Estado = 'carregando' | 'sem-chave' | 'sem-suporte' | 'instalar-ios' | 'pedir' | 'ativo' | 'negado'

const CHAVE_PUBLICA = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

function chaveParaBytes(base64: string): BufferSource {
  const preenchida = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const bruto = atob(preenchida)
  const bytes = new Uint8Array(bruto.length)
  for (let i = 0; i < bruto.length; i++) bytes[i] = bruto.charCodeAt(i)
  return bytes as unknown as BufferSource
}

export default function BotaoNotificacoes({ autor }: { autor: Autor }) {
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
        body: JSON.stringify({ ...sub.toJSON(), autor }),
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
    else setAviso(d.enviados > 0 ? 'Teste enviado.' : 'Nenhum aparelho recebeu o teste.')
  }

  // Estados que não pedem acao do usuario ficam ocultos, para manter o rodape discreto.
  if (estado === 'carregando' || estado === 'sem-chave' || estado === 'sem-suporte') return null

  return (
    <div className="notif">
      {estado === 'pedir' && (
        <button type="button" className="link" onClick={ativar} title="Avisa quando o outro adicionar algo novo">
          <IconeSino /> Ativar avisos
        </button>
      )}
      {estado === 'ativo' && (
        <span className="notif-ativo" title="Você recebe um aviso quando o outro adiciona algo novo">
          <IconeSino cheio /> Avisos ativos
          <button type="button" className="link" onClick={testar}>
            testar
          </button>
        </span>
      )}
      {estado === 'instalar-ios' && (
        <span className="notif-dica" title="No iPhone, instale na Tela de Início para receber avisos">
          <IconeSino /> Instale na Tela de Início para ativar
        </span>
      )}
      {estado === 'negado' && (
        <span className="notif-dica" title="Os avisos estão bloqueados nas configurações do aparelho">
          <IconeSino /> Avisos bloqueados no aparelho
        </span>
      )}
      {aviso && (
        <p className="aviso" role="status">
          {aviso}
        </p>
      )}
    </div>
  )
}
