import { db, UUID_RE } from '@/lib/db'
import { listarMomentos } from '@/lib/dados'
import { resposta, rota } from '@/lib/http'

export const dynamic = 'force-dynamic'

export const DELETE = rota(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  if (!UUID_RE.test(id)) return resposta({ erro: 'id_invalido' }, 400)
  const q = await db()
  await q`DELETE FROM momentos WHERE id = ${id}`
  return resposta({ ok: true })
})

export const PATCH = rota(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  if (!UUID_RE.test(id)) return resposta({ erro: 'id_invalido' }, 400)
  const corpo = await req.json().catch(() => null)
  const titulo = String(corpo?.titulo ?? '').trim().slice(0, 120)
  const data = String(corpo?.data ?? '')
  const descricao = String(corpo?.descricao ?? '').trim().slice(0, 2000)
  if (!titulo) return resposta({ erro: 'titulo_obrigatorio' }, 400)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || Number.isNaN(Date.parse(data))) {
    return resposta({ erro: 'data_invalida' }, 400)
  }
  const q = await db()
  await q`UPDATE momentos SET titulo = ${titulo}, data = ${data}, descricao = ${descricao} WHERE id = ${id}`
  return resposta({ momentos: await listarMomentos() })
})
