import { listarQuizPara } from '@/lib/dados'
import { db, UUID_RE } from '@/lib/db'
import { resposta, rota } from '@/lib/http'
import type { Autor } from '@/lib/tipos'

export const dynamic = 'force-dynamic'

export const DELETE = rota(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  if (!UUID_RE.test(id)) return resposta({ erro: 'id_invalido' }, 400)
  const corpo = await req.json().catch(() => null)
  const autor = corpo?.autor as Autor | undefined
  if (autor !== 'ele' && autor !== 'ela') return resposta({ erro: 'autor_invalido' }, 400)

  const q = await db()
  const linha = await q`SELECT autor_criador FROM quiz_perguntas WHERE id = ${id}`
  if (!linha.length) return resposta({ ok: true })
  if (String(linha[0].autor_criador) !== autor) return resposta({ erro: 'nao_autorizado' }, 403)

  await q`DELETE FROM quiz_perguntas WHERE id = ${id}`
  return resposta({ ok: true })
})
