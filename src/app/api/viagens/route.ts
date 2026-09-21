import { listarViagens } from '@/lib/dados'
import { db } from '@/lib/db'
import { resposta, rota } from '@/lib/http'

export const dynamic = 'force-dynamic'

export const GET = rota(async () => resposta({ viagens: await listarViagens() }))

export const POST = rota(async (req: Request) => {
  const corpo = await req.json().catch(() => null)
  const local = String(corpo?.local ?? '').trim().slice(0, 150)
  const data = String(corpo?.data ?? '')
  if (!local) return resposta({ erro: 'local_obrigatorio' }, 400)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || Number.isNaN(Date.parse(data))) {
    return resposta({ erro: 'data_invalida' }, 400)
  }
  const q = await db()
  await q`INSERT INTO viagens (local, data) VALUES (${local}, ${data})`
  return resposta({ viagens: await listarViagens() })
})
