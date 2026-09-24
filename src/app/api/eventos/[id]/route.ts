import { listarEventos } from '@/lib/dados'
import { db, UUID_RE } from '@/lib/db'
import { resposta, rota } from '@/lib/http'
import type { TipoEvento } from '@/lib/tipos'

export const dynamic = 'force-dynamic'

const TIPOS: TipoEvento[] = ['viagem', 'show', 'passeio', 'churrasco', 'jantar', 'outro']
type Ctx = { params: Promise<{ id: string }> }

export const PATCH = rota(async (req: Request, { params }: Ctx) => {
  const { id } = await params
  if (!UUID_RE.test(id)) return resposta({ erro: 'id_invalido' }, 400)
  const corpo = await req.json().catch(() => null)
  const titulo = String(corpo?.titulo ?? '').trim().slice(0, 120)
  const tipo = String(corpo?.tipo ?? 'outro')
  const data = String(corpo?.data ?? '')
  const observacao = String(corpo?.observacao ?? '').trim().slice(0, 500)
  if (!titulo) return resposta({ erro: 'titulo_obrigatorio' }, 400)
  if (!TIPOS.includes(tipo as TipoEvento)) return resposta({ erro: 'tipo_invalido' }, 400)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || Number.isNaN(Date.parse(data))) {
    return resposta({ erro: 'data_invalida' }, 400)
  }
  const q = await db()
  await q`UPDATE eventos SET titulo = ${titulo}, tipo = ${tipo}, data = ${data}, observacao = ${observacao} WHERE id = ${id}`
  return resposta({ eventos: await listarEventos() })
})

export const DELETE = rota(async (_req: Request, { params }: Ctx) => {
  const { id } = await params
  if (!UUID_RE.test(id)) return resposta({ erro: 'id_invalido' }, 400)
  const q = await db()
  await q`DELETE FROM eventos WHERE id = ${id}`
  return resposta({ ok: true })
})
