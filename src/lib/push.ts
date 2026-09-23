import webpush from 'web-push'
import { db } from './db'
import { exigir } from './env'
import type { Autor } from './tipos'

let iniciado = false
function iniciar() {
  if (iniciado) return
  const contato = process.env.VAPID_SUBJECT || `mailto:${process.env.EMAIL_RECUPERACAO || 'contato@example.com'}`
  webpush.setVapidDetails(contato, exigir('NEXT_PUBLIC_VAPID_PUBLIC_KEY'), exigir('VAPID_PRIVATE_KEY'))
  iniciado = true
}

type Inscricao = { endpoint: string; p256dh: string; auth: string }

async function enviarParaLista(inscricoes: Inscricao[], titulo: string, corpo: string) {
  iniciar()
  const q = await db()
  const payload = JSON.stringify({ title: titulo, body: corpo, url: '/' })
  let enviados = 0
  let removidos = 0

  await Promise.all(
    inscricoes.map(async (i) => {
      try {
        await webpush.sendNotification(
          { endpoint: i.endpoint, keys: { p256dh: i.p256dh, auth: i.auth } },
          payload,
        )
        enviados++
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) {
          await q`DELETE FROM push_inscricoes WHERE endpoint = ${i.endpoint}`
          removidos++
        } else {
          console.error('Falha no push', status)
        }
      }
    }),
  )
  return { enviados, removidos, total: inscricoes.length }
}

/** Envia para todos os aparelhos cadastrados (usado pelo cron de aniversario e pelo teste). */
export async function enviarParaTodos(titulo: string, corpo: string) {
  const q = await db()
  const inscricoes = await q`SELECT endpoint, p256dh, auth FROM push_inscricoes`
  return enviarParaLista(inscricoes as Inscricao[], titulo, corpo)
}

/** Envia so para os aparelhos cadastrados como "destino" (ele ou ela). */
export async function enviarParaAutor(destino: Autor, titulo: string, corpo: string) {
  const q = await db()
  const inscricoes = await q`SELECT endpoint, p256dh, auth FROM push_inscricoes WHERE autor = ${destino}`
  return enviarParaLista(inscricoes as Inscricao[], titulo, corpo)
}

/** Envia para o outro (quem nao foi o autor da acao). Nunca lanca erro: falha de push nao deve derrubar a acao. */
export async function enviarParaOutro(origem: Autor, titulo: string, corpo: string) {
  try {
    return await enviarParaAutor(origem === 'ele' ? 'ela' : 'ele', titulo, corpo)
  } catch (e) {
    console.error('Falha ao avisar o outro:', e)
    return null
  }
}
