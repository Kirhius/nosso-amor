import webpush from 'web-push'
import { db } from './db'
import { exigir } from './env'

let iniciado = false
function iniciar() {
  if (iniciado) return
  const contato = process.env.VAPID_SUBJECT || `mailto:${process.env.EMAIL_RECUPERACAO || 'contato@example.com'}`
  webpush.setVapidDetails(contato, exigir('NEXT_PUBLIC_VAPID_PUBLIC_KEY'), exigir('VAPID_PRIVATE_KEY'))
  iniciado = true
}

export async function enviarParaTodos(titulo: string, corpo: string) {
  iniciar()
  const q = await db()
  const inscricoes = await q`SELECT endpoint, p256dh, auth FROM push_inscricoes`
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
