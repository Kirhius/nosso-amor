import { db } from '@/lib/db'
import { resposta, rota } from '@/lib/http'

export const dynamic = 'force-dynamic'

export const POST = rota(async (req: Request) => {
  const corpo = await req.json().catch(() => null)
  const endpoint = String(corpo?.endpoint ?? '')
  const p256dh = String(corpo?.keys?.p256dh ?? '')
  const auth = String(corpo?.keys?.auth ?? '')
  if (!endpoint.startsWith('https://') || !p256dh || !auth) return resposta({ erro: 'inscricao_invalida' }, 400)
  const q = await db()
  await q`INSERT INTO push_inscricoes (endpoint, p256dh, auth) VALUES (${endpoint}, ${p256dh}, ${auth})
          ON CONFLICT (endpoint) DO UPDATE SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth`
  return resposta({ ok: true })
})
