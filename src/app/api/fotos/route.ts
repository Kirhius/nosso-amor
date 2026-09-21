import { listarFotos } from '@/lib/dados'
import { db, UUID_RE } from '@/lib/db'
import { chaveFull, existe } from '@/lib/r2'
import { resposta, rota } from '@/lib/http'

export const dynamic = 'force-dynamic'

export const GET = rota(async () => resposta({ fotos: await listarFotos() }))

export const POST = rota(async (req: Request) => {
  const corpo = await req.json().catch(() => null)
  const id = String(corpo?.id ?? '')
  const legenda = String(corpo?.legenda ?? '').slice(0, 200)
  const largura = Math.max(0, Math.min(20000, Number(corpo?.largura) || 0))
  const altura = Math.max(0, Math.min(20000, Number(corpo?.altura) || 0))
  if (!UUID_RE.test(id)) return resposta({ erro: 'id_invalido' }, 400)
  if (!(await existe(chaveFull(id)))) return resposta({ erro: 'arquivo_nao_encontrado' }, 400)

  const q = await db()
  await q`INSERT INTO fotos (id, legenda, largura, altura) VALUES (${id}, ${legenda}, ${largura}, ${altura})
          ON CONFLICT (id) DO NOTHING`
  return resposta({ fotos: await listarFotos() })
})
