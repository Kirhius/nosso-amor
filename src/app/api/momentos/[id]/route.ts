import { db, UUID_RE } from '@/lib/db'
import { resposta, rota } from '@/lib/http'

export const dynamic = 'force-dynamic'

export const DELETE = rota(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  if (!UUID_RE.test(id)) return resposta({ erro: 'id_invalido' }, 400)
  const q = await db()
  await q`DELETE FROM momentos WHERE id = ${id}`
  return resposta({ ok: true })
})
