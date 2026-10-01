import { listarBilhetes } from '@/lib/dados'
import { db, UUID_RE } from '@/lib/db'
import { resposta, rota } from '@/lib/http'
import type { Autor } from '@/lib/tipos'

export const dynamic = 'force-dynamic'

function autorValido(v: unknown): v is Autor {
  return v === 'ele' || v === 'ela'
}
type Ctx = { params: Promise<{ id: string }> }

export const PATCH = rota(async (req: Request, { params }: Ctx) => {
  const { id } = await params
  if (!UUID_RE.test(id)) return resposta({ erro: 'id_invalido' }, 400)
  const corpo = await req.json().catch(() => null)
  const de = corpo?.de
  const para = corpo?.para
  const texto = String(corpo?.texto ?? '').trim().slice(0, 1000)
  if (!autorValido(de) || !autorValido(para)) return resposta({ erro: 'autor_invalido' }, 400)
  if (!texto) return resposta({ erro: 'texto_obrigatorio' }, 400)

  const q = await db()
  await q`UPDATE bilhetes SET de = ${de}, para = ${para}, texto = ${texto}, editado_em = now() WHERE id = ${id}`
  return resposta({ bilhetes: await listarBilhetes() })
})

export const DELETE = rota(async (_req: Request, { params }: Ctx) => {
  const { id } = await params
  if (!UUID_RE.test(id)) return resposta({ erro: 'id_invalido' }, 400)
  const q = await db()
  await q`DELETE FROM bilhetes WHERE id = ${id}`
  return resposta({ ok: true })
})
