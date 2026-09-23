import { db } from '@/lib/db'
import { resposta, rota } from '@/lib/http'

export const dynamic = 'force-dynamic'

export const POST = rota(async (req: Request) => {
  const corpo = await req.json().catch(() => null)
  const endpoint = String(corpo?.endpoint ?? '')
  const p256dh = String(corpo?.keys?.p256dh ?? '')
  const auth = String(corpo?.keys?.auth ?? '')
  const autor = String(corpo?.autor ?? '')
  if (!endpoint.startsWith('https://') || !p256dh || !auth) return resposta({ erro: 'inscricao_invalida' }, 400)
  if (autor !== 'ele' && autor !== 'ela') return resposta({ erro: 'autor_invalido' }, 400)
  const q = await db()
  await q`INSERT INTO push_inscricoes (endpoint, p256dh, auth, autor) VALUES (${endpoint}, ${p256dh}, ${auth}, ${autor})
          ON CONFLICT (endpoint) DO UPDATE SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth, autor = EXCLUDED.autor`
  return resposta({ ok: true })
})
