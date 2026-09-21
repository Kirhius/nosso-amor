import { db, UUID_RE } from '@/lib/db'
import { apagar, chaveFull, chaveThumb } from '@/lib/r2'
import { resposta, rota } from '@/lib/http'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

export const PATCH = rota(async (req: Request, { params }: Ctx) => {
  const { id } = await params
  if (!UUID_RE.test(id)) return resposta({ erro: 'id_invalido' }, 400)
  const corpo = await req.json().catch(() => null)
  const legenda = String(corpo?.legenda ?? '').slice(0, 200)
  const q = await db()
  await q`UPDATE fotos SET legenda = ${legenda} WHERE id = ${id}`
  return resposta({ ok: true })
})

export const DELETE = rota(async (_req: Request, { params }: Ctx) => {
  const { id } = await params
  if (!UUID_RE.test(id)) return resposta({ erro: 'id_invalido' }, 400)
  const q = await db()
  await q`DELETE FROM fotos WHERE id = ${id}`
  await Promise.allSettled([apagar(chaveFull(id)), apagar(chaveThumb(id))])
  return resposta({ ok: true })
})
