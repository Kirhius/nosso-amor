import { listarViagens } from '@/lib/dados'
import { db, UUID_RE } from '@/lib/db'
import { resposta, rota } from '@/lib/http'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

export const PATCH = rota(async (req: Request, { params }: Ctx) => {
  const { id } = await params
  if (!UUID_RE.test(id)) return resposta({ erro: 'id_invalido' }, 400)
  const corpo = await req.json().catch(() => null)
  const local = String(corpo?.local ?? '').trim().slice(0, 150)
  const data = String(corpo?.data ?? '')
  if (!local) return resposta({ erro: 'local_obrigatorio' }, 400)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || Number.isNaN(Date.parse(data))) {
    return resposta({ erro: 'data_invalida' }, 400)
  }
  const q = await db()
  await q`UPDATE viagens SET local = ${local}, data = ${data} WHERE id = ${id}`
  return resposta({ viagens: await listarViagens() })
})

export const DELETE = rota(async (_req: Request, { params }: Ctx) => {
  const { id } = await params
  if (!UUID_RE.test(id)) return resposta({ erro: 'id_invalido' }, 400)
  const q = await db()
  await q`DELETE FROM viagens WHERE id = ${id}`
  return resposta({ ok: true })
})
