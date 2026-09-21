import { createHash } from 'node:crypto'
import { abrirSessao, hashPin, invalidarSessoes, limparTodasFalhas } from '@/lib/auth'
import { db, setConfig } from '@/lib/db'
import { resposta, rota } from '@/lib/http'

export const dynamic = 'force-dynamic'

export const POST = rota(
  async (req: Request) => {
    const corpo = await req.json().catch(() => null)
    const token = String(corpo?.token ?? '')
    const pin = String(corpo?.pin ?? '')
    if (!/^[0-9a-f]{64}$/.test(token) || !/^\d{4}$/.test(pin)) return resposta({ erro: 'formato' }, 400)

    const hash = createHash('sha256').update(token).digest('hex')
    const q = await db()
    const usado = await q`UPDATE reset_tokens SET usado = true
                          WHERE hash = ${hash} AND usado = false AND expira_em > now()
                          RETURNING hash`
    if (!usado.length) return resposta({ erro: 'token_invalido' }, 400)

    await setConfig('pin_hash', await hashPin(pin))
    await invalidarSessoes()
    await limparTodasFalhas()
    await abrirSessao()
    return resposta({ ok: true })
  },
  { publica: true },
)
