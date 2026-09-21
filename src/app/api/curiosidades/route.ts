import { listarCuriosidades } from '@/lib/dados'
import { db } from '@/lib/db'
import { resposta, rota } from '@/lib/http'

export const dynamic = 'force-dynamic'

export const GET = rota(async () => resposta({ curiosidades: await listarCuriosidades() }))

export const POST = rota(async (req: Request) => {
  const corpo = await req.json().catch(() => null)
  const texto = String(corpo?.texto ?? '').trim().slice(0, 1000)
  const autor = String(corpo?.autor ?? '')
  if (!texto) return resposta({ erro: 'texto_obrigatorio' }, 400)
  if (autor !== 'ele' && autor !== 'ela') return resposta({ erro: 'autor_invalido' }, 400)
  const q = await db()
  await q`INSERT INTO curiosidades (texto, autor) VALUES (${texto}, ${autor})`
  return resposta({ curiosidades: await listarCuriosidades() })
})
